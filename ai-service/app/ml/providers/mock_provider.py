"""
Offline Mock AI Provider.
Deterministic mock implementation of AIProvider for offline testing and fast unit test suites.
"""
from typing import Dict, Any
from app.ml.providers.base import AIProvider


class MockAIProvider(AIProvider):
    """
    Mock AI Provider returning static, predictable responses.
    """

    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str = "en"
    ) -> str:
        if not text:
            return ""
        return f"[Translated: {text.strip()}]"

    async def analyze_image(
        self,
        image_bytes: bytes,
        mime_type: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        return {
            "is_relevant": True,
            "visual_summary": "Mock analysis: Damaged road with visible potholes.",
            "detected_objects": ["road", "pothole"],
            "suggested_categories": ["ROAD_URBAN_INFRASTRUCTURE"],
            "severity_indicators": ["pothole_depth", "traffic_hazard"],
            "confidence": 0.9
        }

    async def analyze_document(
        self,
        extracted_text: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        return {
            "document_summary": "Mock document analysis: Petition regarding water supply disruption.",
            "document_type": "petition",
            "key_facts": ["No water for 10 days", "50 households affected"],
            "affected_population_estimate": "50 households",
            "relevance_score": 0.92
        }

    async def categorize(
        self,
        unified_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        return {
            "primary_category": "WATER_MANAGEMENT",
            "secondary_category": None,
            "confidence": 0.95,
            "reasoning_summary": "Mock categorization: Strong evidence indicating drinking water shortage."
        }

    async def prioritize(
        self,
        unified_context: Dict[str, Any],
        category_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        return {
            "factors": {
                "public_safety_risk": 7,
                "essential_service_disruption": 9,
                "population_impact": 8,
                "duration_of_issue": 7,
                "vulnerable_population_affected": 6,
                "visual_damage_severity": 8
            },
            "explanation": "Mock prioritization: High essential service disruption and population impact."
        }


# Global Mock Provider Instance
mock_ai_provider = MockAIProvider()
