"""
University Routing Schemas: Defines Higher Education Institution (HEI) match recommendation schemas.
"""
from pydantic import BaseModel, Field
from typing import List

class HEIMatch(BaseModel):
    """Schema for individual university recommendation match."""
    hei_id: str = Field(..., description="University ID or Name")
    hei_name: str = Field(..., description="Full university / college name")
    match_score: float = Field(..., description="Relevance score (0.0 to 1.0)")
    rationale: str = Field(..., description="Why this university's lab/faculty was matched")

class RoutingResult(BaseModel):
    """Routing response schema."""
    recommended_heis: List[HEIMatch] = Field(default_factory=list, description="Top ranked university matches")
