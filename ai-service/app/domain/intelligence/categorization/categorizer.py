"""
AI Categorization Engine.
Evaluates Unified Issue Context using AIProvider and maps issues into Jharkhand's 11 core thematic domains.
"""
import logging
from typing import Dict, Any, Optional
from app.ml.providers import get_ai_provider, AIProvider

log = logging.getLogger(__name__)

ALLOWED_CATEGORIES = {
    "WATER_MANAGEMENT",
    "ROAD_URBAN_INFRASTRUCTURE",
    "AGRICULTURE",
    "HEALTHCARE",
    "EDUCATION",
    "SANITATION",
    "ENVIRONMENT",
    "RURAL_LIVELIHOODS",
    "ACCESSIBILITY",
    "ENERGY",
    "PUBLIC_SERVICE_DELIVERY"
}

# Domain keyword fallback rules for heuristic safety & cross-modal weighting (Multilingual EN/HI)
KEYWORD_CATEGORY_RULES = {
    "AGRICULTURE": [
        "crop", "kisan", "farmer", "irrigation", "soil", "harvest", "kheti", "fertilizer",
        "paddy", "leaf", "disease", "pest", "spots", "dhan", "fasal", "paudha", "bimar",
        "krishi", "धान", "फसल", "पौधों", "पौधे", "पत्तियों", "बीमारी", "धब्बे", "किसान",
        "कृषि", "खेत", "उपज"
    ],
    "ENVIRONMENT": [
        "pollution", "forest", "mining", "dust", "tree", "river", "smoke",
        "kiln", "emission", "chimney", "air pollution", "environmental",
        "toxic", "smog", "air quality", "hazardous", "प्रदूषण", "धुआं", "भट्ठा", "हवा"
    ],
    "WATER_MANAGEMENT": ["water", "pani", "pipe", "handpump", "drainage", "well", "jal", "sewage", "पानी", "जल", "नल", "नाली", "कुआं"],
    "ROAD_URBAN_INFRASTRUCTURE": ["road", "pothole", "bridge", "street light", "sadak", "traffic", "highway", "सड़क", "गड्ढा", "पुल", "लाइट"],
    "HEALTHCARE": ["hospital", "doctor", "medicine", "clinic", "swasthya", "ambulance", "health", "disease", "अस्पताल", "डॉक्टर", "दवा", "स्वास्थ्य"],
    "EDUCATION": ["school", "teacher", "student", "college", "book", "shiksha", "classroom", "स्कूल", "शिक्षक", "छात्र", "शिक्षा"],
    "SANITATION": ["garbage", "kachra", "toilet", "swachh", "waste", "drain", "cleanliness", "कचरा", "शौचालय", "सफाई"],
    "ENERGY": ["electricity", "power", "bijli", "transformer", "solar", "voltage", "outage", "बिजली", "पावर", "ट्रांसफॉर्मर"],
    "PUBLIC_SERVICE_DELIVERY": ["pension", "ration", "certificate", "office", "babu", "delay", "bribe", "पेंशन", "राशन", "प्रमाणपत्र", "दफ्तर"]
}

SUBCATEGORY_MAPPING = {
    "AGRICULTURE": {
        "disease": "CROP_DISEASE_OUTBREAK",
        "bimar": "CROP_DISEASE_OUTBREAK",
        "बीमारी": "CROP_DISEASE_OUTBREAK",
        "धब्बे": "CROP_DISEASE_OUTBREAK",
        "paddy": "CROP_DISEASE_OUTBREAK",
        "धान": "CROP_DISEASE_OUTBREAK",
        "irrigation": "IRRIGATION_SUPPLY",
        "kisan": "FARMER_SUBSIDY_SUPPORT"
    },
    "ENVIRONMENT": {
        "smoke": "INDUSTRIAL_AIR_POLLUTION",
        "kiln": "INDUSTRIAL_AIR_POLLUTION",
        "emission": "INDUSTRIAL_AIR_POLLUTION",
        "mining": "MINING_ENVIRONMENTAL_IMPACT",
        "forest": "DEFORESTATION_CONSERVATION",
        "dust": "AIR_QUALITY_DEGRADATION"
    }
}


class IssueCategorizer:
    """
    Categorization engine for Jharkhand Societal Challenges.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai_provider = ai_provider or get_ai_provider()

    def _fallback_keyword_category(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        for category, keywords in KEYWORD_CATEGORY_RULES.items():
            if any(kw.lower() in text_lower for kw in keywords):
                sec_cat = None
                if category in SUBCATEGORY_MAPPING:
                    for sub_kw, sub_name in SUBCATEGORY_MAPPING[category].items():
                        if sub_kw.lower() in text_lower:
                            sec_cat = sub_name
                            break
                return {"primary": category, "secondary": sec_cat}
        return {"primary": "PUBLIC_SERVICE_DELIVERY", "secondary": None}

    async def categorize_issue(self, unified_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes AI categorization and validates category against allowed domain schema.
        Combines Text + Document + Image evidence with text evidence priority.
        """
        try:
            # Aggregate full text evidence (Title + Description + Document Extracted Text)
            comb_text = (unified_context.get("text", {}).get("combined_english_text") or "").lower()
            doc_facts = " ".join(unified_context.get("document_evidence", {}).get("key_facts", [])).lower()
            full_text_evidence = f"{comb_text} {doc_facts}".strip()

            # Check text & document keyword evidence rules first
            heuristic_match = self._fallback_keyword_category(full_text_evidence)

            res = await self.ai_provider.categorize(unified_context)
            primary = (res.get("primary_category") or "").upper().strip()

            # If AI returned invalid or weak fallback category when text strongly indicates domain (e.g. AGRICULTURE)
            if primary not in ALLOWED_CATEGORIES or (primary == "PUBLIC_SERVICE_DELIVERY" and heuristic_match["primary"] != "PUBLIC_SERVICE_DELIVERY"):
                primary = heuristic_match["primary"]
                secondary = heuristic_match["secondary"]
            else:
                secondary = (res.get("secondary_category") or "").upper().strip()
                if secondary not in ALLOWED_CATEGORIES and not secondary.startswith("CROP_") and not secondary.startswith("INDUSTRIAL_"):
                    secondary = heuristic_match["secondary"]

            return {
                "primary_category": primary,
                "secondary_category": secondary,
                "confidence": float(res.get("confidence", 0.92)),
                "reasoning_summary": res.get("reasoning_summary") or f"Issue categorized under {primary} based on multimodal evidence evaluation."
            }

        except Exception as e:
            log.error(f"Categorization failed: {e}", exc_info=True)
            comb_text = unified_context.get("text", {}).get("combined_english_text", "")
            heuristic_match = self._fallback_keyword_category(comb_text)

            return {
                "primary_category": heuristic_match["primary"],
                "secondary_category": heuristic_match["secondary"],
                "confidence": 0.75,
                "reasoning_summary": f"Fallback categorization assigned: {heuristic_match['primary']}."
            }


# Global Categorizer Instance
issue_categorizer = IssueCategorizer()
