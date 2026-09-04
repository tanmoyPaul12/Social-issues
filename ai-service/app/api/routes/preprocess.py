"""
Preprocessing Integration Route: Master Multimodal Form Upload & Standalone Sub-Pipeline Endpoints.
Production-grade FastAPI architecture supporting single-shot testing of Text, Image, Document, and Location.
"""
from fastapi import APIRouter, Header, File, UploadFile, Form, status, Body, HTTPException
from typing import Optional, Dict, Any
import json
import uuid

from app.api.schemas.challenge import ChallengeInput
from app.api.schemas.text import TextInput, ProcessedText
from app.api.schemas.preprocessing import PreprocessingResult
from app.api.schemas.response import APIResponse, success_response
from app.preprocessing.orchestrator import orchestrator
from app.domain.preprocessing.text_preprocessor import text_preprocessor
from app.domain.preprocessing.image.image_preprocessor import image_preprocessor
from app.domain.preprocessing.document.document_preprocessor import document_preprocessor
from app.domain.preprocessing.location.location_processor import location_processor
from app.domain.intelligence.issue_context_builder import build_unified_issue_context
from app.domain.intelligence.issue_validator import evaluate_issue_validity
from app.domain.intelligence.categorization.categorizer import issue_categorizer
from app.domain.intelligence.prioritization.priority_engine import priority_engine

router = APIRouter(tags=["Preprocessing"])


@router.post(
    "/preprocessing/full",
    response_model=APIResponse[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Full Multimodal Single-Shot Testing Endpoint (Form + File Uploads)"
)
async def preprocess_full_multimodal_endpoint(
    title: str = Form(..., description="Raw title of the citizen complaint"),
    description: str = Form(..., description="Detailed description of the issue"),
    latitude: Optional[float] = Form(None, description="GPS Latitude coordinate"),
    longitude: Optional[float] = Form(None, description="GPS Longitude coordinate"),
    district: Optional[str] = Form(None, description="Jharkhand District name"),
    block: Optional[str] = Form(None, description="Administrative Block name"),
    image_file: Optional[UploadFile] = File(None, description="Image evidence file (JPG, PNG, WEBP)"),
    document_file: Optional[UploadFile] = File(None, description="Document attachment (PDF, TXT)"),
    x_request_id: Optional[str] = Header(None, alias="X-Request-ID")
) -> APIResponse[Dict[str, Any]]:
    """
    Master single-shot testing endpoint for Swagger UI & Postman.
    Accepts text, location, image file, and document file simultaneously,
    executes full preprocessing, validity guardrail, domain categorization, and urgency scoring.
    """
    issue_id = f"ISSUE_{uuid.uuid4().hex[:8].upper()}"

    # 1. Text Preprocessing Sub-Pipeline
    processed_text_obj = await text_preprocessor.process(title=title, description=description)
    text_data = processed_text_obj.dict()

    # 2. Location Preprocessing Sub-Pipeline
    location_data = None
    if latitude is not None and longitude is not None:
        location_data = location_processor.process_location(
            latitude=latitude,
            longitude=longitude,
            district=district,
            block=block
        )

    # 3. Image Preprocessing Sub-Pipeline
    image_data = None
    if image_file:
        img_bytes = await image_file.read()
        if img_bytes:
            image_data = await image_preprocessor.process_image(
                image_bytes=img_bytes,
                filename=image_file.filename or "evidence.jpg",
                text_context={"title": title, "description": description}
            )

    # 4. Document Preprocessing Sub-Pipeline
    doc_data = None
    if document_file:
        doc_bytes = await document_file.read()
        if doc_bytes:
            doc_data = await document_preprocessor.process_document(
                doc_bytes=doc_bytes,
                filename=document_file.filename or "petition.pdf",
                text_context={"title": title, "description": description}
            )

    # 5. Build Unified Context
    unified_context = build_unified_issue_context(
        issue_id=issue_id,
        text_data=text_data,
        image_data=image_data,
        document_data=doc_data,
        location_data=location_data
    )

    # 6. Issue Validity Guardrail
    validity_res = evaluate_issue_validity(unified_context)

    # 7. AI Categorization Engine
    cat_res = await issue_categorizer.categorize_issue(unified_context)

    # 8. AI Priority & Urgency Engine
    prio_res = await priority_engine.prioritize_issue(unified_context, cat_res)

    full_response_payload = {
        "issue_id": issue_id,
        "summary": {
            "title": text_data["title"]["english_text"],
            "category": cat_res.get("primary_category"),
            "urgency_level": prio_res.get("urgency_level"),
            "priority_score": prio_res.get("priority_score"),
            "validity_status": validity_res.get("status")
        },
        "preprocessing_results": {
            "text": text_data,
            "location": location_data,
            "image": image_data,
            "document": doc_data
        },
        "intelligence_outputs": {
            "unified_context": unified_context,
            "validity": validity_res,
            "categorization": cat_res,
            "priority": prio_res
        }
    }

    return success_response(
        data=full_response_payload,
        message="Full multimodal preprocessing and AI intelligence executed successfully.",
        request_id=x_request_id
    )


@router.post(
    "/preprocessing/text",
    response_model=APIResponse[ProcessedText],
    status_code=status.HTTP_200_OK,
    summary="Standalone Text Preprocessing Endpoint"
)
async def preprocess_text_standalone(
    payload: TextInput,
    x_request_id: Optional[str] = Header(None, alias="X-Request-ID")
) -> APIResponse[ProcessedText]:
    """
    Preprocesses raw text (Title + Description).
    Normalizes whitespace, detects language & script, transliterates Hinglish to Devanagari,
    and translates to standardized English.
    """
    result: ProcessedText = await text_preprocessor.process(payload.title, payload.description)
    return success_response(
        data=result,
        message="Text preprocessed successfully.",
        request_id=x_request_id
    )


@router.post(
    "/preprocessing/image",
    response_model=APIResponse[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Standalone Image Preprocessing & Vision Analysis Endpoint"
)
async def preprocess_image_standalone(
    file: UploadFile = File(..., description="Image evidence file"),
    context_json: Optional[str] = Form(None, description="Optional JSON string of text context"),
    x_request_id: Optional[str] = Header(None, alias="X-Request-ID")
) -> APIResponse[Dict[str, Any]]:
    """
    Validates, auto-rotates, resizes, generates 300px thumbnail,
    and performs Gemini Vision visual damage analysis on uploaded image.
    """
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file provided.")

    context = {}
    if context_json and context_json.strip():
        try:
            context = json.loads(context_json)
        except Exception:
            context = {}
    result = await image_preprocessor.process_image(
        image_bytes=image_bytes,
        filename=file.filename or "evidence.jpg",
        text_context=context
    )
    return success_response(
        data=result,
        message="Image preprocessed successfully.",
        request_id=x_request_id
    )


@router.post(
    "/preprocessing/document",
    response_model=APIResponse[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Standalone Document Text Extraction & Analysis Endpoint"
)
async def preprocess_document_standalone(
    file: UploadFile = File(..., description="Document file (PDF, TXT)"),
    context_json: Optional[str] = Form(None, description="Optional JSON string of text context"),
    x_request_id: Optional[str] = Header(None, alias="X-Request-ID")
) -> APIResponse[Dict[str, Any]]:
    """
    Extracts text from PDF/TXT document attachments using PyMuPDF (fitz)
    and analyzes key facts & affected population via Gemini Document Intelligence.
    """
    doc_bytes = await file.read()
    if not doc_bytes:
        raise HTTPException(status_code=400, detail="Empty document file provided.")

    context = {}
    if context_json and context_json.strip():
        try:
            context = json.loads(context_json)
        except Exception:
            context = {}
    result = await document_preprocessor.process_document(
        doc_bytes=doc_bytes,
        filename=file.filename or "petition.pdf",
        text_context=context
    )
    return success_response(
        data=result,
        message="Document preprocessed successfully.",
        request_id=x_request_id
    )


@router.post(
    "/preprocessing/location",
    response_model=APIResponse[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Standalone Location Geocoding & Boundary Verification Endpoint"
)
async def preprocess_location_standalone(
    payload: Dict[str, Any] = Body(..., example={"latitude": 23.3441, "longitude": 85.3096, "district": "Ranchi"}),
    x_request_id: Optional[str] = Header(None, alias="X-Request-ID")
) -> APIResponse[Dict[str, Any]]:
    """
    Validates range of GPS coordinates and checks compliance against
    Jharkhand's 24 administrative districts.
    """
    result = location_processor.process_location(
        latitude=payload.get("latitude"),
        longitude=payload.get("longitude"),
        district=payload.get("district"),
        block=payload.get("block"),
        gram_panchayat=payload.get("gram_panchayat")
    )
    return success_response(
        data=result,
        message="Location verified successfully.",
        request_id=x_request_id
    )


@router.post(
    "/preprocessing/json",
    response_model=APIResponse[PreprocessingResult],
    status_code=status.HTTP_200_OK,
    summary="Master Preprocessing Endpoint (JSON Payload)"
)
async def preprocess_challenge_json(
    payload: ChallengeInput,
    x_request_id: Optional[str] = Header(None, alias="X-Request-ID")
) -> APIResponse[PreprocessingResult]:
    """
    Microservice endpoint accepting standardized JSON ChallengeInput.
    """
    result: PreprocessingResult = await orchestrator.process(payload)
    return success_response(
        data=result,
        message=f"Challenge '{payload.challenge_id}' preprocessed successfully.",
        request_id=x_request_id
    )
