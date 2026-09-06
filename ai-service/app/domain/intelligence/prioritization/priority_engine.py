"""
Hybrid Priority & Urgency Scoring Engine.
Extracts 6 urgency factors using AIProvider and computes a deterministic category-aware 0-100 score matrix,
classifying issues into LOW, MEDIUM, HIGH, or CRITICAL urgency tiers.
"""
import logging
from typing import Dict, Any, Optional
from app.ml.providers import get_ai_provider, AIProvider

log = logging.getLogger(__name__)

# Category-Aware Factor Weight Matrices (Total for each category = 1.0)
CATEGORY_FACTOR_WEIGHTS: Dict[str, Dict[str, float]] = {
    "AGRICULTURE": {
        "population_impact": 0.30,               # Widespread farmer community impact
        "vulnerable_population_affected": 0.25,  # Smallholder / marginal farmers
        "duration_of_issue": 0.20,               # Crop disease spread rate
        "visual_damage_severity": 0.15,          # Visible crop leaf damage
        "public_safety_risk": 0.10,              # Food security / livelihood risk
        "essential_service_disruption": 0.00     # Zero weight for crop disease
    },
    "ENVIRONMENT": {
        "public_safety_risk": 0.35,              # Health risk from pollution / emissions
        "population_impact": 0.25,               # Size of affected community
        "vulnerable_population_affected": 0.20,  # Children, elderly, respiratory patients
        "visual_damage_severity": 0.15,          # Smoke plume / pollution visibility
        "duration_of_issue": 0.05,               # Continuous vs intermittent
        "essential_service_disruption": 0.00     # Zero weight for environment/pollution!
    },
    "ROAD_URBAN_INFRASTRUCTURE": {
        "public_safety_risk": 0.35,              # Accident risk from potholes/bridges
        "visual_damage_severity": 0.25,          # Road damage visibility
        "essential_service_disruption": 0.20,     # Traffic blockage
        "population_impact": 0.10,               # Commuters affected
        "vulnerable_population_affected": 0.05,
        "duration_of_issue": 0.05
    },
    "WATER_MANAGEMENT": {
        "essential_service_disruption": 0.35,     # No water supply
        "population_impact": 0.25,               # Village population
        "public_safety_risk": 0.15,              # Contaminated water risk
        "vulnerable_population_affected": 0.15,
        "duration_of_issue": 0.05,
        "visual_damage_severity": 0.05
    },
    "HEALTHCARE": {
        "public_safety_risk": 0.40,              # Medical emergency risk
        "vulnerable_population_affected": 0.25,
        "population_impact": 0.20,
        "essential_service_disruption": 0.10,
        "duration_of_issue": 0.05,
        "visual_damage_severity": 0.00
    },
    "DEFAULT": {
        "public_safety_risk": 0.25,
        "essential_service_disruption": 0.20,
        "population_impact": 0.20,
        "duration_of_issue": 0.15,
        "vulnerable_population_affected": 0.10,
        "visual_damage_severity": 0.10
    }
}


class PriorityEngine:
    """
    Category-Aware Priority Scoring Engine combining AI factor extraction with deterministic scoring.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai_provider = ai_provider or get_ai_provider()

    def _get_weights_for_category(self, category: Optional[str]) -> Dict[str, float]:
        cat_upper = (category or "").upper()
        if cat_upper in CATEGORY_FACTOR_WEIGHTS:
            return CATEGORY_FACTOR_WEIGHTS[cat_upper]
        return CATEGORY_FACTOR_WEIGHTS["DEFAULT"]

    def _compute_score(self, factors: Dict[str, float], category: Optional[str] = None) -> float:
        """Calculates category-aware weighted total score on a 0-100 scale."""
        weights = self._get_weights_for_category(category)
        total_score = 0.0
        for factor_name, weight in weights.items():
            val = float(factors.get(factor_name, 5.0))
            val = max(0.0, min(10.0, val))  # Clamp to 0-10 scale
            total_score += (val * 10.0) * weight

        return round(total_score, 1)

    def _determine_urgency_level(self, score: float) -> str:
        if score >= 81.0:
            return "CRITICAL"
        elif score >= 61.0:
            return "HIGH"
        elif score >= 31.0:
            return "MEDIUM"
        return "LOW"

    async def prioritize_issue(
        self,
        unified_context: Dict[str, Any],
        category_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculates category-aware issue priority score and urgency tier.
        """
        try:
            primary_cat = category_info.get("primary_category") if isinstance(category_info, dict) else str(category_info)

            res = await self.ai_provider.prioritize(unified_context, category_info)
            factors = res.get("factors", {})

            # Ensure all 6 factors exist
            sanitized_factors = {}
            weights = self._get_weights_for_category(primary_cat)
            for k in weights.keys():
                sanitized_factors[k] = float(factors.get(k, 5.0))

            # Adjust factors for specific categories
            cat_upper = (primary_cat or "").upper()
            if cat_upper == "ENVIRONMENT":
                sanitized_factors["essential_service_disruption"] = 0.0
                sanitized_factors["public_safety_risk"] = max(8.0, sanitized_factors.get("public_safety_risk", 8.0))
                sanitized_factors["population_impact"] = max(7.0, sanitized_factors.get("population_impact", 7.0))
                sanitized_factors["vulnerable_population_affected"] = max(8.0, sanitized_factors.get("vulnerable_population_affected", 8.0))
            elif cat_upper == "AGRICULTURE":
                sanitized_factors["essential_service_disruption"] = 0.0
                sanitized_factors["population_impact"] = max(7.5, sanitized_factors.get("population_impact", 7.5))
                sanitized_factors["vulnerable_population_affected"] = max(8.0, sanitized_factors.get("vulnerable_population_affected", 8.0))

            score = self._compute_score(sanitized_factors, primary_cat)
            urgency_level = self._determine_urgency_level(score)

            return {
                "priority_score": score,
                "urgency_level": urgency_level,
                "factors": sanitized_factors,
                "explanation": res.get("explanation") or f"Category-aware priority score {score} ({urgency_level}) evaluated for domain '{primary_cat}'."
            }

        except Exception as e:
            log.error(f"Priority evaluation failed: {e}", exc_info=True)
            primary_cat = category_info.get("primary_category") if isinstance(category_info, dict) else "DEFAULT"
            weights = self._get_weights_for_category(primary_cat)
            fallback_factors = {k: 5.0 for k in weights.keys()}
            score = self._compute_score(fallback_factors, primary_cat)

            return {
                "priority_score": score,
                "urgency_level": "MEDIUM",
                "factors": fallback_factors,
                "explanation": "Default priority assigned due to factor assessment fallback."
            }


# Global Priority Engine Instance
priority_engine = PriorityEngine()
