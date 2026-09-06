"""
Evidence Schema: Preprocessed evidence model.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from app.api.schemas.enums import AttachmentType, ProcessingStatus


class ImageMetadata(BaseModel):
    width: int = Field(..., description="Image width in pixels.")
    height: int = Field(..., description="Image height in pixels.")
    format: str = Field(..., description="Image format string.")
    file_size_bytes: int = Field(..., description="File size in bytes.")
    capture_timestamp: Optional[str] = Field(None, description="EXIF capture timestamp.")
    gps_latitude: Optional[float] = Field(None, description="EXIF GPS latitude.")
    gps_longitude: Optional[float] = Field(None, description="EXIF GPS longitude.")


class VideoMetadata(BaseModel):
    duration_seconds: float = Field(..., description="Video duration in seconds.")
    fps: float = Field(..., description="Video frames per second.")
    frame_count: int = Field(..., description="Total frame count.")
    width: int = Field(..., description="Frame width in pixels.")
    height: int = Field(..., description="Frame height in pixels.")
    extracted_frame_urls: Optional[List[str]] = Field(None, description="Extracted keyframe URLs.")


class DocumentMetadata(BaseModel):
    page_count: int = Field(..., description="Document page count.")
    text_extracted: bool = Field(..., description="True if text layer extracted.")
    ocr_used: bool = Field(..., description="True if OCR was required.")
    extracted_text_url: Optional[str] = Field(None, description="URL to extracted text file.")


class ProcessedEvidence(BaseModel):
    attachment_id: Optional[str] = Field(None, description="Unique attachment ID.")
    original_url: str = Field(..., description="Original file URL in object storage.")
    file_name: str = Field(..., description="Original filename.")
    file_type: AttachmentType = Field(..., description="Attachment category: IMAGE, VIDEO, DOCUMENT.")
    processing_status: ProcessingStatus = Field(..., description="Preprocessing status.")
    processed_url: Optional[str] = Field(None, description="Normalized file URL.")
    thumbnail_url: Optional[str] = Field(None, description="Thumbnail preview URL.")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Type-specific technical metadata.")
    error_message: Optional[str] = Field(None, description="Error details if processing failed.")

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "attachment_id": "ATT-9921",
                    "original_url": "https://storage.example.com/CH-1024/road.jpg",
                    "file_name": "road.jpg",
                    "file_type": "IMAGE",
                    "processing_status": "COMPLETED",
                    "processed_url": "https://storage.example.com/processed/CH-1024/road.webp",
                    "thumbnail_url": "https://storage.example.com/thumbnails/CH-1024/road_thumb.webp",
                    "metadata": {
                        "width": 4032,
                        "height": 3024,
                        "format": "JPEG",
                        "file_size_bytes": 2457600
                    },
                    "error_message": None
                }
            ]
        }
    )
