"""
Location Schema: Processed location model.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class ProcessedLocation(BaseModel):
    """
    Normalized and enriched location data.
    """

    latitude: float = Field(..., ge=-90.0, le=90.0, description="WGS84 latitude.")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="WGS84 longitude.")
    district: str = Field(..., description="District name.")
    block: Optional[str] = Field(None, description="Block or Tehsil name.")
    village_or_ward: Optional[str] = Field(None, description="Village, Panchayat, or Ward name.")
    landmark_notes: Optional[str] = Field(None, description="Citizen-provided landmark notes.")
    state: str = Field(default="Jharkhand", description="State name.")
    country: str = Field(default="India", description="Country name.")
    location_confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Location resolution confidence score.")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "latitude": 23.344100,
                "longitude": 85.309600,
                "district": "Ranchi",
                "block": "Kanke",
                "village_or_ward": "Hesalong Village",
                "landmark_notes": "Near school",
                "state": "Jharkhand",
                "country": "India",
                "location_confidence": 0.95
            }
        }
    )
