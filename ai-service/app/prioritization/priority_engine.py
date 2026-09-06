"""
Priority Engine: Calculates overall impact score and assigns urgency level.
"""
from typing import Optional, Dict, Any
from app.api.schemas.priority import PriorityResult
from app.prioritization.priority_rules import get_domain_base_score, detect_urgency_bonus


def compute_text_priority(
    text: str,
    domain_category: str = "GOVERNANCE",
    affected_population: Optional[int] = None
) -> Dict[str, Any]:
    """
    Computes priority score (0.00 to 1.00) and urgency level based on domain and text urgency.
    """
    base_score = get_domain_base_score(domain_category)
    urgency_bonus = detect_urgency_bonus(text)
    
    pop_bonus = 0.0
    if affected_population:
        if affected_population > 10000:
            pop_bonus = 0.15
        elif affected_population > 1000:
            pop_bonus = 0.10
        elif affected_population > 100:
            pop_bonus = 0.05

    final_score = round(min(base_score + urgency_bonus + pop_bonus, 0.99), 2)

    if final_score >= 0.80:
        level = "CRITICAL"
    elif final_score >= 0.65:
        level = "HIGH"
    elif final_score >= 0.45:
        level = "MEDIUM"
    else:
        level = "LOW"

    rationale = f"Domain base: {base_score}, Urgency signals bonus: {urgency_bonus:.2f}, Population bonus: {pop_bonus:.2f}."

    return {
        "score": final_score,
        "urgency_level": level,
        "domain_category": domain_category,
        "rationale": rationale
    }


def calculate_challenge_priority(challenge: Any) -> PriorityResult:
    """Calculates impact score and priority result from ChallengeInput schema."""
    full_text = f"{getattr(challenge, 'title', '')} {getattr(challenge, 'description', '')}"
    pop = getattr(challenge, "affected_population", None)
    res = compute_text_priority(text=full_text, domain_category="GOVERNANCE", affected_population=pop)
    
    score_int = int(res["score"] * 100)
    return PriorityResult(
        impact_score=score_int,
        urgency_level=res["urgency_level"],
        rationale=res["rationale"]
    )
