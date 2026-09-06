"""
Categorization Routes: Standalone domain classification endpoint.
"""
from fastapi import APIRouter
from app.api.schemas.challenge import ChallengeInput
from app.api.schemas.category import CategoryResult
from app.categorization.classifier import classify_challenge_domain

router = APIRouter(tags=["Categorization"])

@router.post("/categorize", response_model=CategoryResult)
def categorize_challenge(payload: ChallengeInput):
    """Classifies challenge title & description into 10 Jharkhand research domains."""
    return classify_challenge_domain(payload.title, payload.description)
