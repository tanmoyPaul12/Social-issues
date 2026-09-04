"""
Schema Verification Suite: Tests for Phase 1 Data Contract & Pydantic Schemas.

Validates:
1. Valid ChallengeInput parsing.
2. ChallengeInput with optional fields missing.
3. Invalid latitude / longitude validation failure.
4. Invalid enum value handling.
5. Image attachment parsing.
6. Video attachment parsing.
7. Document attachment parsing.
8. Complete PreprocessingResult serialization.
"""
import pytest
from pydantic import ValidationError
from app.api.schemas.enums import ProblemCategory, PriorityLevel, AttachmentType, ProcessingStatus, EvidenceStatus
from app.api.schemas.attachment import AttachmentInput
from app.api.schemas.challenge import ChallengeInput
from app.api.schemas.text import ProcessedText
from app.api.schemas.location import ProcessedLocation
from app.api.schemas.evidence import ProcessedEvidence, ImageMetadata, VideoMetadata, DocumentMetadata
from app.api.schemas.preprocessing import PreprocessingResult
from app.api.schemas.response import APIResponse, success_response, error_response


def test_valid_challenge_input():
    data = {
        "challenge_id": "CH-1001",
        "title": "Broken Handpump in Ward 4",
        "description": "The water handpump has been non-functional for 3 weeks affecting 200 families.",
        "district": "Ranchi",
        "block": "Kanke",
        "village_or_ward": "Ward 4",
        "latitude": 23.3441,
        "longitude": 85.3096,
        "landmark_notes": "Near community center",
        "reported_priority": "HIGH",
        "affected_population": 500,
        "attachments": []
    }
    challenge = ChallengeInput(**data)
    assert challenge.challenge_id == "CH-1001"
    assert challenge.reported_priority == PriorityLevel.HIGH
    assert challenge.latitude == 23.3441


def test_challenge_input_missing_optional_fields():
    data = {
        "challenge_id": "CH-1002",
        "title": "Road Repair Required",
        "description": "Potholes along the main road cause frequent accidents.",
        "district": "Bokaro",
        "latitude": 23.6693,
        "longitude": 86.1511
    }
    challenge = ChallengeInput(**data)
    assert challenge.challenge_id == "CH-1002"
    assert challenge.block is None
    assert challenge.reported_priority is None
    assert challenge.affected_population is None
    assert challenge.attachments == []


def test_invalid_latitude_longitude():
    with pytest.raises(ValidationError):
        ChallengeInput(
            challenge_id="CH-1003",
            title="Invalid Location Problem Title",
            description="Test description long enough to pass validation.",
            district="Dhanbad",
            latitude=120.0,  # Invalid latitude (> 90)
            longitude=85.0
        )


def test_invalid_enum_value():
    with pytest.raises(ValidationError):
        AttachmentInput(
            file_url="https://example.com/file.png",
            file_name="file.png",
            mime_type="image/png",
            file_type="INVALID_TYPE"  # Invalid enum value
        )


def test_valid_image_attachment():
    att = AttachmentInput(
        file_url="https://storage.example.com/ch-1/img.jpg",
        file_name="img.jpg",
        mime_type="image/jpeg",
        file_type=AttachmentType.IMAGE
    )
    assert att.file_type == AttachmentType.IMAGE
    assert att.mime_type == "image/jpeg"


def test_valid_video_attachment():
    att = AttachmentInput(
        file_url="https://storage.example.com/ch-1/video.mp4",
        file_name="video.mp4",
        mime_type="video/mp4",
        file_type=AttachmentType.VIDEO
    )
    assert att.file_type == AttachmentType.VIDEO


def test_valid_document_attachment():
    att = AttachmentInput(
        file_url="https://storage.example.com/ch-1/doc.pdf",
        file_name="doc.pdf",
        mime_type="application/pdf",
        file_type=AttachmentType.DOCUMENT
    )
    assert att.file_type == AttachmentType.DOCUMENT


from app.api.schemas.text import SingleFieldTextResult

def test_complete_preprocessing_result_serialization():
    title_field = SingleFieldTextResult(
        original_text="पानी की समस्या",
        normalized_text="पानी की समस्या",
        detected_language="hi",
        script="devanagari",
        is_romanized=False,
        language_confidence=0.98,
        translation_required=True,
        transliterated_text=None,
        english_text="Water problem",
        translation_status="completed",
        translation_provider="indictrans2",
        translation_error=None
    )

    desc_field = SingleFieldTextResult(
        original_text="हमारे गांव में पानी की समस्या है।",
        normalized_text="हमारे गांव में पानी की समस्या है।",
        detected_language="hi",
        script="devanagari",
        is_romanized=False,
        language_confidence=0.98,
        translation_required=True,
        transliterated_text=None,
        english_text="There is a water problem in our village.",
        translation_status="completed",
        translation_provider="indictrans2",
        translation_error=None
    )

    text_res = ProcessedText(
        title=title_field,
        description=desc_field,
        combined_english_text="Water problem. There is a water problem in our village.",
        processing_status="completed"
    )

    loc_res = ProcessedLocation(
        latitude=23.3441,
        longitude=85.3096,
        district="Ranchi",
        block="Kanke",
        village_or_ward="Hesalong",
        landmark_notes="Near school",
        state="Jharkhand",
        country="India",
        location_confidence=0.95
    )

    evidence_res = ProcessedEvidence(
        attachment_id="ATT-1",
        original_url="https://storage.example.com/orig.jpg",
        file_name="orig.jpg",
        file_type=AttachmentType.IMAGE,
        processing_status=ProcessingStatus.COMPLETED,
        processed_url="https://storage.example.com/proc.webp",
        thumbnail_url="https://storage.example.com/thumb.webp",
        metadata={
            "width": 1920,
            "height": 1080,
            "format": "JPEG",
            "file_size_bytes": 102400
        }
    )

    result = PreprocessingResult(
        challenge_id="CH-999",
        processing_status=ProcessingStatus.COMPLETED,
        text=text_res,
        location=loc_res,
        evidence=[evidence_res]
    )

    dumped = result.model_dump()
    assert dumped["challenge_id"] == "CH-999"
    assert dumped["processing_status"] == "COMPLETED"
    assert dumped["text"]["title"]["detected_language"] == "hi"
    assert dumped["location"]["state"] == "Jharkhand"
    assert dumped["evidence"][0]["file_type"] == "IMAGE"
