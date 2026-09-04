"""
Challenge Schema: The primary input contract between the Java Spring Boot backend
and the Python AI microservice.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from app.api.schemas.enums import PriorityLevel
from app.api.schemas.attachment import AttachmentInput

# Backwards compatibility alias for MediaAttachmentInput
MediaAttachmentInput = AttachmentInput



import uuid

class ChallengeInput(BaseModel):
    """
    Validated citizen challenge submission sent from Java backend to AI service.
    """

    challenge_id: str = Field(
        default_factory=lambda: f"CH-{uuid.uuid4().hex[:6].upper()}",
        description="Unique identifier for the challenge, assigned by backend or auto-generated.",
        examples=["CH-1024"]
    )

    title: str = Field(
        ...,
        min_length=5,
        max_length=300,
        description="Short, descriptive title of the societal problem.",
        examples=["Broken handpump in Kanke village"]
    )

    description: str = Field(
        ...,
        min_length=20,
        description="Detailed description of the societal problem written by the citizen.",
        examples=["The village handpump has not worked for three months. Over 200 families are affected."]
    )

    district: str = Field(
        ...,
        description="Name of the Jharkhand district where the problem is located.",
        examples=["Bokaro"]
    )

    block: Optional[str] = Field(
        None,
        description="Block or Tehsil within the district.",
        examples=["Chas"]
    )

    village_or_ward: Optional[str] = Field(
        None,
        description="Village name, Panchayat name, or Urban Local Body ward number.",
        examples=["Hesalong Village"]
    )

    latitude: float = Field(
        ...,
        ge=-90.0,
        le=90.0,
        description="WGS84 latitude coordinate of the problem location.",
        examples=[23.6693]
    )

    longitude: float = Field(
        ...,
        ge=-180.0,
        le=180.0,
        description="WGS84 longitude coordinate of the problem location.",
        examples=[86.1511]
    )

    landmark_notes: Optional[str] = Field(
        None,
        max_length=500,
        description="Additional location context provided by the citizen.",
        examples=["Near old banyan tree"]
    )

    reported_priority: Optional[PriorityLevel] = Field(
        None,
        description="Priority level SELECTED BY THE CITIZEN at submission time. Subjective."
    )

    affected_population: Optional[int] = Field(
        None,
        ge=1,
        description="Citizen's estimate of the number of people affected by this problem.",
        examples=[1200]
    )

    attachments: List[AttachmentInput] = Field(
        default_factory=list,
        description="List of evidence files attached to this submission."
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "challenge_id": "CH-1024",
                "title": "Broken village handpump — no water for 3 months",
                "description": "The handpump at Hesalong village junction has been broken since June. Over 300 families have no access to clean water.",
                "district": "Bokaro",
                "block": "Chas",
                "village_or_ward": "Hesalong Village",
                "latitude": 23.6693,
                "longitude": 86.1511,
                "landmark_notes": "Near primary school",
                "reported_priority": "HIGH",
                "affected_population": 1200,
                "attachments": [
                    {
                        "file_url": "https://storage.example.com/CH-1024/handpump.jpg",
                        "file_name": "handpump.jpg",
                        "mime_type": "image/jpeg",
                        "file_type": "IMAGE"
                    }
                ]
            }
        }
    )
