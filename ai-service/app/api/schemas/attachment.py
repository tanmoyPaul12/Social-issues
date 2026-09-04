"""
Attachment Schema: Represents a single evidence file attached to a citizen submission.
"""
from pydantic import BaseModel, Field, ConfigDict
from app.api.schemas.enums import AttachmentType


class AttachmentInput(BaseModel):
    """
    A single evidence file attached to a citizen challenge submission.
    """

    file_url: str = Field(
        ...,
        description="Presigned URL to the original file in object storage (S3, MinIO, or Azure Blob).",
        examples=["https://storage.example.com/challenges/CH-123/road-damage.jpg"]
    )

    file_name: str = Field(
        ...,
        description="Original filename as uploaded by the citizen, including extension.",
        examples=["road-damage.jpg"]
    )

    mime_type: str = Field(
        ...,
        description="MIME content type of the file (e.g. image/jpeg, video/mp4, application/pdf).",
        examples=["image/jpeg"]
    )

    file_type: AttachmentType = Field(
        ...,
        description="Explicit file category for routing: IMAGE, VIDEO, or DOCUMENT."
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "file_url": "https://storage.example.com/challenges/CH-123/road-damage.jpg",
                    "file_name": "road-damage.jpg",
                    "mime_type": "image/jpeg",
                    "file_type": "IMAGE"
                }
            ]
        }
    )
