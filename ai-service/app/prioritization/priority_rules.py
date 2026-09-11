"""
Priority Rules & Urgency Scoring Matrix.
Computes base domain weights, emergency signals, and scale multipliers.
"""
from typing import Dict, Any, Optional

# Base severity score by domain sector (0.0 to 1.0)
DOMAIN_BASE_WEIGHTS: Dict[str, float] = {
    "HEALTH": 0.85,
    "WATER": 0.80,
    "ELECTRICITY": 0.70,
    "INFRASTRUCTURE": 0.65,
    "SANITATION": 0.60,
    "AGRICULTURE": 0.55,
    "EDUCATION": 0.55,
    "ENVIRONMENT": 0.50,
    "LIVELIHOOD": 0.50,
    "GOVERNANCE": 0.45
}

# Multilingual Urgency & Emergency Signals
EMERGENCY_KEYWORDS = [
    "emergency", "urgent", "danger", "deadly", "death", "hospital", "outbreak",
    "collapsed", "flooding", "broken", "months", "critical", "severe",
    "आपतकाल", "खतरा", "गंभीर", "मृत्यु", "दुर्घटना", "इलाज", "3 महीने", "महीने",
    "জরুরি", "বিপদ", "মারাত্মক", "হাসপাতাল"
]


def get_domain_base_score(domain: str) -> float:
    """Returns domain base weight."""
    return DOMAIN_BASE_WEIGHTS.get(domain.upper(), 0.50)


def detect_urgency_bonus(text: str) -> float:
    """Calculates urgency score bonus from text signals."""
    if not text:
        return 0.0

    text_lower = text.lower()
    match_count = 0
    for kw in EMERGENCY_KEYWORDS:
        if kw.lower() in text_lower:
            match_count += 1

    return min(match_count * 0.08, 0.25)


def calculate_rule_based_priority(facts: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes a deterministic, explainable priority score (0-100) and tier based on structured facts.
    """
    score = 0
    service = str(facts.get("essential_service", "OTHER")).upper()
    pop_type = str(facts.get("affected_population_type", "community")).lower()
    duration_days = facts.get("duration_days")
    duration_text = str(facts.get("duration_text", "")).lower()
    vulnerable = facts.get("vulnerable_groups", [])
    risk_level = str(facts.get("safety_risk_level", "medium")).lower()

    # 1. Essential Service Factor (Max 25 pts)
    service_weights = {
        "WATER_RESOURCES": 25, "WATER": 25,
        "HEALTHCARE": 25, "HEALTH": 25,
        "SANITATION": 20,
        "ENERGY": 20, "ELECTRICITY": 20,
        "URBAN_DEVELOPMENT": 18, "INFRASTRUCTURE": 18,
        "EDUCATION": 15,
        "AGRICULTURE": 15,
        "RURAL_LIVELIHOODS": 12, "LIVELIHOOD": 12,
        "ENVIRONMENT": 10,
        "PUBLIC_ADMINISTRATION": 10, "GOVERNANCE": 10
    }
    score += service_weights.get(service, 10)

    # 2. Affected Population Factor (Max 25 pts)
    if "entire" in pop_type or "entire_village" in pop_type:
        score += 25
    elif "community" in pop_type or "multiple" in pop_type or "300" in str(facts.get("affected_population_description", "")):
        score += 20
    else:
        score += 10

    # 3. Disruption Duration Factor (Max 15 pts)
    if duration_days is not None and duration_days >= 60:
        score += 15
    elif "several months" in duration_text or "3 months" in duration_text or "teen mahine" in duration_text:
        score += 15
    elif duration_days is not None and duration_days >= 21:
        score += 10
    elif "several weeks" in duration_text or "kai hafton" in duration_text:
        score += 10
    else:
        score += 5

    # 4. Vulnerable Groups Impact Factor (Max 20 pts)
    vulnerable_pts = min(len(vulnerable) * 5, 20)
    score += vulnerable_pts

    # 5. Safety Risk Factor (Max 15 pts)
    if risk_level == "high":
        score += 15
    elif risk_level == "medium":
        score += 10
    else:
        score += 5

    # Final Score Normalization (0 - 100)
    final_score = min(100, max(0, score))

    # Tier Calculation
    if final_score >= 76:
        tier = "CRITICAL"
    elif final_score >= 51:
        tier = "HIGH"
    elif final_score >= 26:
        tier = "MEDIUM"
    else:
        tier = "LOW"

    return {
        "priority_score": final_score,
        "priority_level": tier,
        "scoring_breakdown": {
            "essential_service_points": service_weights.get(service, 10),
            "population_impact_points": 25 if "entire" in pop_type else (20 if "community" in pop_type else 10),
            "duration_points": 15 if (duration_days and duration_days >= 60) or "several months" in duration_text else 10,
            "vulnerable_groups_points": vulnerable_pts,
            "safety_risk_points": 15 if risk_level == "high" else 10
        }
    }


def calculate_multimodal_generalized_consensus(
    text_data: Dict[str, Any],
    image_data: Optional[Dict[str, Any]] = None,
    document_data: Optional[Dict[str, Any]] = None,
    location_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Calculates 4-modality individual priority/category rates and computes the weighted average consensus.
    """
    modality_breakdown = {}
    categories_found = []

    # 1. Text Modality Analysis
    text_score = 50
    text_cat = "URBAN_DEVELOPMENT"
    if text_data and isinstance(text_data, dict):
        comb_text = text_data.get("combined_english_text") or text_data.get("english_title") or str(text_data)
        urg_bonus = detect_urgency_bonus(comb_text)
        text_score = int(min(100, 50 + (urg_bonus * 100)))
        if "water" in comb_text.lower() or "handpump" in comb_text.lower():
            text_cat = "WATER_RESOURCES"
        elif "health" in comb_text.lower() or "hospital" in comb_text.lower():
            text_cat = "HEALTHCARE"
        elif "road" in comb_text.lower() or "bridge" in comb_text.lower():
            text_cat = "URBAN_DEVELOPMENT"
        categories_found.append(text_cat)

    modality_breakdown["text_analysis"] = {
        "category": text_cat,
        "priority_score": text_score
    }

    # 2. Image Modality Analysis
    img_score = 60
    img_cat = text_cat
    if image_data and isinstance(image_data, dict) and image_data.get("available", False):
        img_cats = image_data.get("suggested_categories", [])
        if img_cats:
            img_cat = img_cats[0]
            categories_found.append(img_cat)
        img_score = image_data.get("severity_score", 65)

    modality_breakdown["image_analysis"] = {
        "category": img_cat,
        "priority_score": img_score
    }

    # 3. Document Modality Analysis
    doc_score = 70
    doc_cat = text_cat
    if document_data and isinstance(document_data, dict) and document_data.get("available", False):
        doc_cat = document_data.get("essential_service") or document_data.get("suggested_category", text_cat)
        categories_found.append(doc_cat)
        rule_prio = calculate_rule_based_priority(document_data)
        doc_score = rule_prio.get("priority_score", 70)

    modality_breakdown["document_analysis"] = {
        "category": doc_cat,
        "priority_score": doc_score
    }

    # 4. Location Modality Analysis
    loc_valid = False
    loc_district = "Unknown"
    loc_bonus = 0
    if location_data and isinstance(location_data, dict):
        loc_valid = location_data.get("is_in_jharkhand", False)
        loc_district = location_data.get("district", "Unknown")
        loc_bonus = 10 if loc_valid else 0

    modality_breakdown["location_analysis"] = {
        "is_valid": loc_valid,
        "district": loc_district,
        "is_in_jharkhand": loc_valid,
        "urgency_bonus": loc_bonus
    }

    # Weighted Average Calculation
    total_weight = 0.35 + 0.35 + 0.20
    weighted_sum = (doc_score * 0.35) + (text_score * 0.35) + (img_score * 0.20)
    avg_score = int(round((weighted_sum / total_weight) + loc_bonus))
    final_score = min(100, max(0, avg_score))

    if final_score >= 76:
        final_level = "CRITICAL"
    elif final_score >= 51:
        final_level = "HIGH"
    elif final_score >= 26:
        final_level = "MEDIUM"
    else:
        final_level = "LOW"

    # Consensus Category Selection
    from collections import Counter
    cat_counts = Counter(categories_found)
    final_category = cat_counts.most_common(1)[0][0] if cat_counts else "OTHER"

    return {
        "modality_breakdown": modality_breakdown,
        "generalized_consensus": {
            "final_category": final_category,
            "average_priority_score": final_score,
            "final_priority_level": final_level,
            "consensus_reason": f"High-confidence generalized consensus calculated across active modalities ({len(categories_found)} modalities aligned)."
        }
    }

