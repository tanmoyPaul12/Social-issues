"""
Duplicate Detection Schemas: Defines vector & spatial duplicate check results.
"""
from pydantic import BaseModel, Field
from typing import List, Optional

class DuplicateMatch(BaseModel):
    """Schema for individual duplicate ticket matches."""
    issue_number: str = Field(..., description="Existing issue number")
    similarity_score: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")
    distance_km: float = Field(..., description="Spatial distance in kilometers")

class DuplicateResult(BaseModel):
    """Deduplication result schema."""
    is_duplicate: bool = Field(..., description="True if potential duplicate exists within threshold")
    cluster_id: Optional[str] = Field(None, description="Duplicate cluster ID if grouped")
    potential_duplicates: List[DuplicateMatch] = Field(default_factory=list, description="Top matching duplicate challenges")
