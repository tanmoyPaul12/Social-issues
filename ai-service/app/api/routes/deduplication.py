"""
Deduplication Routes: Standalone vector & spatial duplicate checking endpoint.
"""
from fastapi import APIRouter
from app.api.schemas.challenge import ChallengeInput
from app.api.schemas.duplicate import DuplicateResult
from app.deduplication.duplicate_checker import check_for_duplicates

router = APIRouter(tags=["Deduplication"])

@router.post("/deduplicate", response_model=DuplicateResult)
def deduplicate_challenge(payload: ChallengeInput):
    """Checks for duplicate submissions within spatial distance & vector threshold."""
    return check_for_duplicates(payload)
