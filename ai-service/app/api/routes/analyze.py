"""
Analyze Routes: Master endpoint executing end-to-end challenge validation,
categorization, prioritization, deduplication, and HEI university routing.
"""
from fastapi import APIRouter
from app.api.schemas.challenge import ChallengeInput
from app.pipelines.challenge_pipeline import process_challenge_pipeline_async

router = APIRouter(tags=["Analysis Pipeline"])

@router.post("/analyze")
async def analyze_challenge(payload: ChallengeInput):
    """
    Executes full multi-modal AI processing pipeline for incoming grassroots challenge,
    returning unified text processing, domain categorization, and urgency prioritization JSON.
    """
    result = await process_challenge_pipeline_async(payload)
    return result
