"""
FastAPI Router for Master Unified Multimodal Intelligence & University Routing Engine (`app/api/unified_routing.py`).

Exposes unified REST API endpoints:
  POST /api/v1/unified-routing/analyze         (JSON Payload for Web/Mobile Apps)
  POST /api/v1/unified-routing/analyze-upload  (Interactive Swagger /docs File Upload Endpoint for Photos & Documents)
  GET  /api/v1/unified-routing/health          (Health Check)
"""

import base64
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel, Field

from app.graphs.unified_pipeline_graph import UnifiedIntelligencePipeline, UnifiedPipelineInput, UnifiedPipelineOutput

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/unified-routing",
    tags=["Unified Multimodal & University Routing Engine"]
)

_master_pipeline = UnifiedIntelligencePipeline()


@router.post("/analyze", response_model=UnifiedPipelineOutput, status_code=status.HTTP_200_OK)
async def analyze_and_route_societal_problem(input_data: UnifiedPipelineInput):
    """
    Executes the End-to-End Master Unified Intelligence Pipeline (JSON Payload):
      1. Multimodal Validation, Authenticity Check & Document Verification
      2. 10-Domain Societal Classification & Urgency/Severity Prioritization
      3. Spatial Bounding & Semantic Text Deduplication Check
      4. Academic Requirement Extraction (Groq openai/gpt-oss-120b)
      5. Supabase PGVector Hybrid Dense Retrieval
      6. 6-Factor Deterministic Institutional Capability Scoring
      7. Matched Faculty Expert Contact Card Reranking
      8. Evidence-Backed Policy & Nodal Officer Report Synthesis
    """
    try:
        logger.info(f"Received Master Unified Routing Request for text length {len(input_data.problem_text)}")
        output = _master_pipeline.run(input_data)
        return output
    except Exception as e:
        logger.error(f"Error executing Master Unified Intelligence API: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Master pipeline execution failed: {str(e)}"
        )


def _extract_document_text(filename: str, content: bytes) -> str:
    """Extracts clean text from document files (TXT, MD, or PDF using PyMuPDF)."""
    if not content:
        return ""
    
    filename_lower = (filename or "").lower()
    if filename_lower.endswith(".pdf") or content.startswith(b"%PDF"):
        try:
            import fitz  # PyMuPDF
            pdf_doc = fitz.open(stream=content, filetype="pdf")
            extracted_pages = [page.get_text() for page in pdf_doc if page.get_text()]
            full_pdf_text = "\n".join(extracted_pages).strip()
            if full_pdf_text:
                logger.info(f"Successfully extracted {len(full_pdf_text)} chars from PDF '{filename}' ({len(pdf_doc)} pages)")
                return full_pdf_text
        except Exception as e:
            logger.warning(f"PyMuPDF extraction failed for '{filename}' ({e}), falling back to raw decode.")

    return content.decode("utf-8", errors="ignore").strip()


@router.post("/analyze-upload", response_model=UnifiedPipelineOutput, status_code=status.HTTP_200_OK)
async def analyze_and_route_with_file_uploads(
    problem_text: str = Form(..., description="Problem statement text / complaint"),
    latitude: Optional[float] = Form(default=None, description="GPS Latitude (e.g. 23.7957)"),
    longitude: Optional[float] = Form(default=None, description="GPS Longitude (e.g. 86.4304)"),
    district: Optional[str] = Form(default="Dhanbad", description="District name"),
    state: Optional[str] = Form(default="Jharkhand", description="State name"),
    image_file: Optional[UploadFile] = File(default=None, description="Optional photo file (JPG, PNG, WEBP)"),
    secondary_image_file: Optional[UploadFile] = File(default=None, description="Optional second photo file"),
    video_file: Optional[UploadFile] = File(default=None, description="Optional 1-minute video file (MP4, MOV, AVI, WEBM) for video keyframe verification"),
    document_file: Optional[UploadFile] = File(default=None, description="Optional document file (TXT, MD, PDF)")
):
    """
    Interactive Swagger UI (/docs) File Upload Testing Endpoint.
    Select photo files (JPG/PNG), 1-minute video files (MP4/MOV), and document files (TXT/MD/PDF) directly from your computer folder!
    """
    video_temp_path = None
    try:
        import tempfile
        import os

        image_b64_list = []
        for img in [image_file, secondary_image_file]:
            if img and hasattr(img, "filename") and img.filename and len(img.filename.strip()) > 0:
                content = await img.read()
                if content and len(content) > 0:
                    b64_str = base64.b64encode(content).decode("utf-8")
                    image_b64_list.append(b64_str)

        document_text = None
        if document_file and hasattr(document_file, "filename") and document_file.filename and len(document_file.filename.strip()) > 0:
            doc_content = await document_file.read()
            if doc_content and len(doc_content) > 0:
                document_text = _extract_document_text(document_file.filename, doc_content)

        if video_file and hasattr(video_file, "filename") and video_file.filename and len(video_file.filename.strip()) > 0:
            v_content = await video_file.read()
            if v_content and len(v_content) > 0:
                suffix = os.path.splitext(video_file.filename)[1] or ".mp4"
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_v:
                    tmp_v.write(v_content)
                    video_temp_path = tmp_v.name
                logger.info(f"Saved video upload to temporary path '{video_temp_path}' ({len(v_content)} bytes)")

        input_data = UnifiedPipelineInput(
            problem_text=problem_text,
            document_text=document_text,
            image_b64_list=image_b64_list if image_b64_list else None,
            video_path_or_url=video_temp_path,
            latitude=latitude,
            longitude=longitude,
            district=district,
            state=state
        )

        logger.info(f"Received Swagger File Upload Routing Request: text={len(problem_text)}, images={len(image_b64_list)}, video={bool(video_temp_path)}, doc={bool(document_text)}")
        output = _master_pipeline.run(input_data)
        return output
    except Exception as e:
        logger.error(f"Error executing Swagger File Upload Master API: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Master pipeline file upload execution failed: {str(e)}"
        )
    finally:
        if video_temp_path and os.path.exists(video_temp_path):
            try:
                os.remove(video_temp_path)
            except Exception:
                pass


@router.get("/health", status_code=status.HTTP_200_OK)
async def master_pipeline_health():
    """Health check endpoint for Master Unified Pipeline."""
    return {
        "status": "healthy",
        "service": "Master Unified Multimodal & University Routing Engine",
        "societal_domains": 10,
        "llm_engine": "Groq API (openai/gpt-oss-120b) + NVIDIA NIM Vision",
        "vector_database": "Supabase PGVector (multilingual-e5-small)"
    }
