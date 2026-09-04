"""
Orchestrator Unit Test: Verifies PreprocessingOrchestrator execution logic.
"""
import pytest
from app.api.schemas.challenge import ChallengeInput
from app.api.schemas.attachment import AttachmentInput
from app.api.schemas.enums import PriorityLevel, AttachmentType, ProcessingStatus
from app.preprocessing.orchestrator import orchestrator


@pytest.mark.anyio
async def test_orchestrator_process_success():
    payload = ChallengeInput(
        challenge_id="CH-8801",
        title="Broken Water Handpump",
        description="The village handpump has not worked for three months. Over 200 families are affected.",
        district="Ranchi",
        block="Kanke",
        village_or_ward="Hesalong Village",
        latitude=23.3441,
        longitude=85.3096,
        landmark_notes="Near primary school",
        reported_priority=PriorityLevel.HIGH,
        affected_population=1200,
        attachments=[
            AttachmentInput(
                file_url="https://storage.example.com/ch-8801/pump.jpg",
                file_name="pump.jpg",
                mime_type="image/jpeg",
                file_type=AttachmentType.IMAGE
            )
        ]
    )

    result = await orchestrator.process(payload)

    assert result.challenge_id == "CH-8801"
    assert result.processing_status == ProcessingStatus.COMPLETED
    assert result.text.detected_language == "en"
    assert result.location.state == "Jharkhand"
    assert result.location.district == "Ranchi"
    assert len(result.evidence) == 1
    assert result.evidence[0].file_type == AttachmentType.IMAGE
    assert len(result.errors) == 0
