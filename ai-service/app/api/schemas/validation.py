"""
Validation Schemas: Standard JSON schemas for text, photo, video, document, and location validation results.
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ValidatorItemResult(BaseModel):
    """Schema for individual item validation results."""
    status: str = Field(..., description="PASS, FLAG, REJECT, CONSISTENT, MISMATCH, or NOT_PROVIDED")
    quality: float = Field(1.0, description="Quality score between 0.0 and 1.0")
    issues: List[str] = Field(default_factory=list, description="List of issues or warnings")

class LocationValidationItemResult(BaseModel):
    """Schema for location validation results."""
    status: str = Field(..., description="CONSISTENT, MISMATCH, OUT_OF_BOUNDS, or FLAG")
    confidence: float = Field(1.0, description="Confidence score between 0.0 and 1.0")
    is_inside_jharkhand: bool = Field(True, description="GIS Jharkhand boundary flag")
    issues: List[str] = Field(default_factory=list, description="Location warning or error issues")

class ValidationResponse(BaseModel):
    """Standardized 3-state validation response payload schema."""
    overall_status: str = Field(..., description="🟢 PASS, 🟡 FLAG, or 🔴 REJECT")
    quality_score: float = Field(..., description="Aggregate data quality score (0.0 to 1.0)")
    text: Dict[str, Any] = Field(..., description="Text validation details")
    location: Dict[str, Any] = Field(..., description="Location validation details")
    photo: Dict[str, Any] = Field(..., description="Photo validation details")
    video: Dict[str, Any] = Field(..., description="Video validation details")
    document: Dict[str, Any] = Field(..., description="Document validation details")
