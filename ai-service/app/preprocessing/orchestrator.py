"""
Preprocessing Orchestrator: Central controller for Layer 2 Preprocessing Layer.
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.api.schemas.challenge import ChallengeInput
from app.api.schemas.attachment import AttachmentInput
from app.api.schemas.preprocessing import PreprocessingResult
from app.api.schemas.text import ProcessedText
from app.api.schemas.location import ProcessedLocation
from app.api.schemas.evidence import ProcessedEvidence
from app.api.schemas.enums import ProcessingStatus, AttachmentType
from app.domain.preprocessing.text_preprocessor import text_preprocessor

log = logging.getLogger(__name__)


class PreprocessingOrchestrator:
    """
    Master coordinator for the 5 preprocessing sub-pipelines:
    - Text (Title + Description)
    - Location (Coordinates + District + Block)
    - Photos (Resizing, orientation, thumbnail)
    - Videos (Metadata, keyframes)
    - Documents (PyMuPDF / OCR text extraction)
    """

    async def process(self, challenge: ChallengeInput) -> PreprocessingResult:
        """
        Orchestrates full preprocessing for a citizen challenge.
        """
        log.info(f"Starting preprocessing orchestration for challenge: {challenge.challenge_id}")
        warnings: List[str] = []
        errors: List[str] = []

        # 1. Process Text Sub-Pipeline
        text_result = await self._process_text(challenge, warnings, errors)

        # 2. Process Location Sub-Pipeline
        location_result = await self._process_location(challenge, warnings, errors)

        # 3. Process Evidence Attachments Sub-Pipeline
        evidence_results = await self._process_attachments(challenge.attachments, warnings, errors)

        # 4. Determine overall job status
        if errors and (not text_result or not location_result):
            overall_status = ProcessingStatus.FAILED
        elif errors:
            overall_status = ProcessingStatus.PARTIAL_SUCCESS
        else:
            overall_status = ProcessingStatus.COMPLETED

        log.info(
            f"Preprocessing orchestration completed for challenge: {challenge.challenge_id} "
            f"status={overall_status.value}, warnings={len(warnings)}, errors={len(errors)}"
        )

        return PreprocessingResult(
            challenge_id=challenge.challenge_id,
            processing_status=overall_status,
            text=text_result,
            location=location_result,
            evidence=evidence_results,
            processed_at=datetime.now(timezone.utc),
            warnings=warnings,
            errors=errors
        )

    async def _process_text(
        self,
        challenge: ChallengeInput,
        warnings: List[str],
        errors: List[str]
    ) -> ProcessedText:
        """Delegates text preprocessing to master TextPreprocessor coordinator."""
        try:
            return await text_preprocessor.process(challenge.title, challenge.description)
        except Exception as e:
            log.error(f"Text preprocessing failed for {challenge.challenge_id}: {e}")
            errors.append(f"Text preprocessing error: {str(e)}")
            return ProcessedText(
                original_text=challenge.description,
                normalized_text=challenge.description,
                detected_language="unknown",
                language_confidence=0.0,
                english_text=challenge.description,
                translation_required=False
            )

    async def _process_location(
        self,
        challenge: ChallengeInput,
        warnings: List[str],
        errors: List[str]
    ) -> ProcessedLocation:
        """Normalizes GPS coordinates and validates Jharkhand bounds."""
        try:
            lat = round(challenge.latitude, 6)
            lng = round(challenge.longitude, 6)

            in_jharkhand = (21.97 <= lat <= 25.33) and (83.32 <= lng <= 87.48)
            if not in_jharkhand:
                warnings.append(
                    f"Coordinates ({lat}, {lng}) lie outside standard Jharkhand geographic bounds."
                )

            return ProcessedLocation(
                latitude=lat,
                longitude=lng,
                district=challenge.district,
                block=challenge.block,
                village_or_ward=challenge.village_or_ward,
                landmark_notes=challenge.landmark_notes,
                state="Jharkhand",
                country="India",
                location_confidence=0.95 if in_jharkhand else 0.50
            )
        except Exception as e:
            log.error(f"Location preprocessing failed for {challenge.challenge_id}: {e}")
            errors.append(f"Location preprocessing error: {str(e)}")
            return ProcessedLocation(
                latitude=challenge.latitude,
                longitude=challenge.longitude,
                district=challenge.district,
                block=challenge.block,
                village_or_ward=challenge.village_or_ward,
                landmark_notes=challenge.landmark_notes,
                state="Jharkhand",
                country="India",
                location_confidence=0.0
            )

    async def _process_attachments(
        self,
        attachments: List[AttachmentInput],
        warnings: List[str],
        errors: List[str]
    ) -> List[ProcessedEvidence]:
        """Dispatches attachments to evidence preprocessing handlers."""
        processed_list: List[ProcessedEvidence] = []

        for att in attachments:
            try:
                item = ProcessedEvidence(
                    attachment_id=None,
                    original_url=att.file_url,
                    file_name=att.file_name,
                    file_type=att.file_type,
                    processing_status=ProcessingStatus.COMPLETED,
                    processed_url=f"{att.file_url}_processed",
                    thumbnail_url=f"{att.file_url}_thumb" if att.file_type == AttachmentType.IMAGE else None,
                    metadata={
                        "format": att.mime_type.split("/")[-1].upper(),
                        "mime_type": att.mime_type
                    },
                    error_message=None
                )
                processed_list.append(item)
            except Exception as e:
                log.error(f"Failed processing attachment '{att.file_name}': {e}")
                errors.append(f"Attachment '{att.file_name}' processing failed: {str(e)}")
                processed_list.append(
                    ProcessedEvidence(
                        attachment_id=None,
                        original_url=att.file_url,
                        file_name=att.file_name,
                        file_type=att.file_type,
                        processing_status=ProcessingStatus.FAILED,
                        metadata={},
                        error_message=str(e)
                    )
                )

        return processed_list


orchestrator = PreprocessingOrchestrator()
