"""
Routing Routes: Standalone HEI university matcher endpoint.
"""
from fastapi import APIRouter
from app.api.schemas.challenge import ChallengeInput
from app.api.schemas.routing import RoutingResult
from app.routing.university_matcher import match_universities_for_challenge
from app.categorization.classifier import classify_challenge_domain

router = APIRouter(tags=["University Routing"])

@router.post("/route", response_model=RoutingResult)
def route_challenge_to_university(payload: ChallengeInput):
    """Recommends top Jharkhand Higher Education Institutions (HEIs) for challenge."""
    category_res = classify_challenge_domain(payload.title, payload.description)
    return match_universities_for_challenge(payload, category_res.primary_category)
