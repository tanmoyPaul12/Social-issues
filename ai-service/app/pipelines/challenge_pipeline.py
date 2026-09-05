"""
Master Challenge Pipeline: Orchestrates text preprocessing, domain categorization,
and urgency prioritization into a unified public issue analysis JSON output.
"""
from typing import Dict, Any
from datetime import datetime, timezone
import asyncio

from app.api.schemas.challenge import ChallengeInput
from app.domain.preprocessing.text_preprocessor import text_preprocessor
from app.categorization.classifier import classify_challenge_domain
from app.prioritization.priority_engine import compute_text_priority

# Map Category Names to lowercase simplified slugs
CATEGORY_SLUG_MAP = {
    "Water Management & Hydrology": "water_management",
    "Healthcare & Public Health": "healthcare",
    "Rural Infrastructure & Transport": "infrastructure",
    "Agriculture & Agro-Tech": "agriculture",
    "Energy & Electricity": "electricity",
    "Sanitation & Waste Management": "sanitation",
    "Education & Skilling": "education",
    "Livelihood & Rural Employment": "livelihoods",
    "Environment & Climate Resilience": "environment",
    "Governance & Public Service Delivery": "governance"
}


async def process_challenge_pipeline_async(challenge: ChallengeInput) -> Dict[str, Any]:
    """
    Executes text preprocessing, domain categorization, and priority calculation
    and formats output into the exact requested Public Issue Analysis JSON schema.
    """
    # 1. Text Preprocessing (Title & Description)
    processed_text_obj = await text_preprocessor.process(title=challenge.title, description=challenge.description)
    text_dict = processed_text_obj.dict()

    title_eng = text_dict["title"]["english_text"]
    desc_eng = text_dict["description"]["english_text"]
    combined_eng = text_dict["combined_english_text"]

    # 2. Categorization based on processed text
    category_res = classify_challenge_domain(title_eng, desc_eng)
    primary_cat = category_res.primary_category
    cat_slug = CATEGORY_SLUG_MAP.get(primary_cat, primary_cat.lower().replace(" ", "_"))

    # 3. Prioritization Calculation
    prio_res = compute_text_priority(
        text=combined_eng,
        domain_category=primary_cat,
        affected_population=getattr(challenge, "affected_population", None)
    )

    score_100 = int(prio_res["score"] * 100)
    urgency_lvl = prio_res["urgency_level"].lower()

    # Determine Factor Breakdown
    severity_val = "high" if prio_res["score"] >= 0.70 else ("medium" if prio_res["score"] >= 0.45 else "low")
    urgency_val = "high" if urgency_lvl in ["critical", "high"] else "medium"
    public_impact_val = "high" if getattr(challenge, "affected_population", 0) and getattr(challenge, "affected_population", 0) > 1000 else "medium"

    formatted_payload = {
        "success": True,
        "message": "Public issue analyzed successfully.",
        "data": {
            "text_processing": {
                "title": {
                    "original_text": text_dict["title"]["original_text"],
                    "normalized_text": text_dict["title"]["normalized_text"],
                    "detected_language": text_dict["title"]["detected_language"],
                    "script": text_dict["title"]["script"],
                    "is_romanized": text_dict["title"]["is_romanized"],
                    "english_text": title_eng,
                    "translation_status": text_dict["title"]["translation_status"]
                },
                "description": {
                    "original_text": text_dict["description"]["original_text"],
                    "detected_language": text_dict["description"]["detected_language"],
                    "english_text": desc_eng,
                    "translation_status": text_dict["description"]["translation_status"]
                },
                "combined_english_text": combined_eng
            },
            "categorization": {
                "category": cat_slug,
                "confidence": round(category_res.confidence_score, 2)
            },
            "prioritization": {
                "priority_score": score_100,
                "priority_level": urgency_lvl,
                "factors": {
                    "severity": severity_val,
                    "urgency": urgency_val,
                    "public_impact": public_impact_val,
                    "safety_risk": "medium"
                },
                "reason": f"The issue affects access to essential {cat_slug.replace('_', ' ')} services."
            }
        },
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    }

    return formatted_payload


def process_challenge_pipeline(challenge: ChallengeInput) -> Dict[str, Any]:
    """Sync wrapper for process_challenge_pipeline_async."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            return loop.run_until_complete(process_challenge_pipeline_async(challenge))
        else:
            return asyncio.run(process_challenge_pipeline_async(challenge))
    except Exception:
        return asyncio.run(process_challenge_pipeline_async(challenge))
