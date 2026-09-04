"""
Validation Routes: Exposes standalone deterministic validation endpoint (/api/v1/validate).
Executes text, photo, video, document, and location validators without running heavy AI models.
"""
from fastapi import APIRouter, File, UploadFile, Form
from typing import Optional
from app.api.schemas.challenge import ChallengeInput
from app.api.schemas.validation import ValidationResponse
from app.validation.orchestrator import orchestrate_validation, orchestrate_validation_with_file_bytes

router = APIRouter(tags=["Validation"])

@router.post("/validate", response_model=ValidationResponse)
def validate_submission(payload: ChallengeInput):
    """
    Fast deterministic validation endpoint checking text, photo, video, document, and location inputs.
    Returns 3-state output: PASS (🟢), FLAG (🟡), or REJECT (🔴).
    """
    result = orchestrate_validation(payload)
    return result

@router.post("/validate/file", response_model=ValidationResponse)
async def validate_file_submission(
    title: str = Form("Broken Check-Dam Sluice Gate"),
    description: str = Form("The sluice gate in Kanke block is leaking water leading to agricultural runoff."),
    district: str = Form("Ranchi"),
    block: str = Form("Kanke"),
    latitude: float = Form(23.3441),
    longitude: float = Form(85.3096),
    file: Optional[UploadFile] = File(None)
):
    """
    Direct File Upload Validation Endpoint:
    Upload a real Photo (.jpg, .png), Video (.mp4), or PDF Document (.pdf) file directly from your computer
    to test Pillow blur/brightness, PyMuPDF text extraction, and OpenCV media inspection in real time!
    """
    file_bytes = None
    file_name = ""
    content_type = ""
    
    if file:
        file_bytes = await file.read()
        file_name = file.filename
        content_type = file.content_type

    result = orchestrate_validation_with_file_bytes(
        title=title,
        description=description,
        district=district,
        block=block,
        latitude=latitude,
        longitude=longitude,
        file_bytes=file_bytes,
        file_name=file_name,
        content_type=content_type
    )
    return result
