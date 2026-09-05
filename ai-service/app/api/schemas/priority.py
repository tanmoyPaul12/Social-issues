"""
Prioritization Schemas: Defines urgency and social impact priority calculation schemas.
"""
from pydantic import BaseModel, Field

class PriorityResult(BaseModel):
    """Priority scoring schema."""
    impact_score: int = Field(..., description="Overall calculated impact score (10 to 100)")
    urgency_level: str = Field(..., description="LOW, MEDIUM, HIGH, or CRITICAL")
    rationale: str = Field(..., description="Explanation of priority scoring factors")
