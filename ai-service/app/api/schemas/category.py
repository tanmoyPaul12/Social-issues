"""
Categorization Schemas: Defines AI domain classification response data contracts.
Matches 10 Official Jharkhand Research Domains.
"""
from pydantic import BaseModel, Field
from typing import List, Dict

class CategoryResult(BaseModel):
    """AI classification result schema."""
    primary_category: str = Field(..., description="Top classified research domain")
    confidence_score: float = Field(..., description="Classification confidence (0.0 to 1.0)")
    secondary_categories: List[str] = Field(default_factory=list, description="Secondary related domains")
    domain_scores: Dict[str, float] = Field(default_factory=dict, description="Per-domain confidence breakdown")
