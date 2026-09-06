"""
Evidence Score: Computes evidence quality confidence score based on attached media files.
"""
from typing import List
from app.api.schemas.attachment import AttachmentInput


def calculate_evidence_score(attachments: List[AttachmentInput]) -> float:
    """Calculates evidence confidence score (0.0 to 10.0)."""
    if not attachments:
        return 2.0  # Basic score for text-only submission
        
    score = 5.0
    for att in attachments:
        if att.mime_type.startswith("image/"):
            score += 2.0
        elif att.mime_type.startswith("video/"):
            score += 3.0
        elif "pdf" in att.mime_type or "document" in att.mime_type:
            score += 1.5
            
    return min(10.0, score)
