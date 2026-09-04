"""
Issue Validity Guardrail.
Inspects Unified Issue Context to filter spam, gibberish, and fake submissions,
classifying issues into VALID, NEEDS_REVIEW, or LIKELY_INVALID without deleting data.
"""
import logging
from typing import Dict, Any

log = logging.getLogger(__name__)


def evaluate_issue_validity(unified_context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates issue validity based on multimodal evidence context.
    Returns status (VALID, NEEDS_REVIEW, LIKELY_INVALID), confidence score, and reasoning.
    """
    text_ctx = unified_context.get("text", {})
    english_title = text_ctx.get("english_title", "").strip()
    english_desc = text_ctx.get("english_description", "").strip()
    combined = text_ctx.get("combined_english_text", "").strip()

    image_ev = unified_context.get("image_evidence", {})
    doc_ev = unified_context.get("document_evidence", {})
    loc_ctx = unified_context.get("location", {})

    # Rule 1: Text empty or extremely short (< 10 chars)
    if len(combined) < 10:
        return {
            "status": "LIKELY_INVALID",
            "confidence": 0.9,
            "reason": "Submitted complaint text is too short or empty to describe a valid societal challenge."
        }

    # Rule 2: Repeated gibberish check
    words = combined.lower().split()
    if len(words) > 5 and len(set(words)) == 1:
        return {
            "status": "LIKELY_INVALID",
            "confidence": 0.95,
            "reason": "Complaint text contains repetitive spam keywords."
        }

    # Rule 3: Check image/document relevance if attached
    relevance_flags = []
    if image_ev.get("available") and not image_ev.get("is_relevant", True):
        relevance_flags.append("Attached photo marked irrelevant by AI Vision analysis.")

    if doc_ev.get("available") and doc_ev.get("relevance_score", 1.0) < 0.3:
        relevance_flags.append("Attached document has low relevance score.")

    if loc_ctx.get("conflict_detected"):
        relevance_flags.append("Location conflict detected between GPS coordinates and selected district.")

    if len(relevance_flags) >= 2:
        return {
            "status": "NEEDS_REVIEW",
            "confidence": 0.75,
            "reason": "; ".join(relevance_flags)
        }

    return {
        "status": "VALID",
        "confidence": 0.92,
        "reason": "Submission contains valid complaint description and supporting evidence."
    }
