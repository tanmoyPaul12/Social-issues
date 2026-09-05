"""
Verification Engine: Orchestrates multi-modal verification scoring.
"""
from app.api.schemas.challenge import ChallengeInput
from app.verification.evidence_score import calculate_evidence_score

def run_verification_engine(challenge: ChallengeInput) -> dict:
    """Runs evidence quality verification and cross-checks."""
    ev_score = calculate_evidence_score(challenge.attachments)
    return {
        "evidence_quality_score": ev_score,
        "is_verified": ev_score >= 5.0
    }
