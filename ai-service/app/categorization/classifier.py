"""
Domain Classifier: Uses multilingual keyword affinity to classify submitted challenges into official research domains.
"""
from typing import Dict
from app.api.schemas.category import CategoryResult
from app.categorization.category_definitions import OFFICIAL_DOMAINS
from app.categorization.multilingual_categorizer import multilingual_categorizer


def classify_challenge_domain(title: str, description: str) -> CategoryResult:
    """Classifies challenge into one of the 10 official research domains across languages."""
    full_text = f"{title} {description}".strip()
    res = multilingual_categorizer.classify_text(full_text)
    
    primary = res["primary_category"]
    confidence = res["confidence"]
    scores = res["scores"]

    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    secondary = [k for k, v in sorted_scores[1:3] if v > 0]

    return CategoryResult(
        primary_category=OFFICIAL_DOMAINS.get(primary, primary),
        confidence_score=confidence,
        secondary_categories=[OFFICIAL_DOMAINS.get(s, s) for s in secondary],
        domain_scores={OFFICIAL_DOMAINS.get(k, k): round(v, 2) for k, v in scores.items()}
    )
