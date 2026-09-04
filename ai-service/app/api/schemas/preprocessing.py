"""
Preprocessing Schema: PreprocessingResult model.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
from app.api.schemas.enums import ProcessingStatus
from app.api.schemas.text import ProcessedText
from app.api.schemas.location import ProcessedLocation
from app.api.schemas.evidence import ProcessedEvidence


class PreprocessingResult(BaseModel):
    """
    Standardized result of the preprocessing pipeline for a challenge.
    """

    challenge_id: str = Field(..., description="Challenge ID linking back to Java database record.")
    processing_status: ProcessingStatus = Field(..., description="Overall preprocessing job status.")
    text: ProcessedText = Field(..., description="Text preprocessing result.")
    location: ProcessedLocation = Field(..., description="Location preprocessing result.")
    evidence: List[ProcessedEvidence] = Field(default_factory=list, description="Preprocessed evidence list.")
    processed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC completion timestamp.")
    warnings: List[str] = Field(default_factory=list, description="Non-fatal warning messages.")
    errors: List[str] = Field(default_factory=list, description="Error messages if processing failed.")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "challenge_id": "CH-1024",
                "processing_status": "COMPLETED",
                "text": {
                    "original_text": "The handpump has not worked for three months.",
                    "normalized_text": "The handpump has not worked for three months.",
                    "detected_language": "en",
                    "language_confidence": 0.99,
                    "english_text": "The handpump has not worked for three months.",
                    "translation_required": False
                },
                "location": {
                    "latitude": 23.669300,
                    "longitude": 86.151100,
                    "district": "Bokaro",
                    "block": "Chas",
                    "village_or_ward": "Hesalong Village",
                    "landmark_notes": "Near school",
                    "state": "Jharkhand",
                    "country": "India",
                    "location_confidence": 0.95
                },
                "evidence": [],
                "processed_at": "2026-09-02T11:30:00Z",
                "warnings": [],
                "errors": []
            }
        }
    )
