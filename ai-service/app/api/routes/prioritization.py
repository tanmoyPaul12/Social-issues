"""
Prioritization Routes: Standalone priority & urgency scoring endpoint.
"""
from fastapi import APIRouter
from app.api.schemas.challenge import ChallengeInput
from app.api.schemas.priority import PriorityResult
from app.prioritization.priority_engine import calculate_challenge_priority

router = APIRouter(tags=["Prioritization"])

@router.post("/prioritize", response_model=PriorityResult)
def prioritize_challenge(payload: ChallengeInput):
    """Calculates impact score and assigns urgency level."""
    return calculate_challenge_priority(payload)
