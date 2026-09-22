"""
Taxonomy Normalizer Module.
Maps raw academic research text into canonical societal challenge domain tokens
(e.g., 'water_quality', 'clean_energy', 'mining_safety') while retaining original raw wording.
"""
import re
from typing import List, Dict, Any
from pydantic import BaseModel, Field

class ResearchInterestItem(BaseModel):
    raw: str = Field(description="Original raw text from university page")
    normalized: List[str] = Field(default_factory=list, description="Canonical societal domain tokens")

# Standardized Societal Challenge Domains Taxonomy Dictionary
DOMAIN_TAXONOMY_MAP: Dict[str, List[str]] = {
    "WATER_QUALITY_HYDROGEOLOGY": [
        "water", "hydrogeology", "groundwater", "arsenic", "fluoride", "effluent",
        "wastewater", "sanitation", "hydrology", "drinking water", "water treatment"
    ],
    "MINING_SAFETY_GEOLOGY": [
        "mining", "mine safety", "rock mechanics", "geology", "underground coal",
        "slope stability", "ventilation", "excavation", "slag", "mineral"
    ],
    "CLEAN_ENERGY_POWER": [
        "solar", "renewable", "energy", "power", "grid", "microgrid", "battery",
        "clean energy", "inverter", "photovoltaics", "biomass"
    ],
    "AGRICULTURE_CLIMATE": [
        "agriculture", "crop", "farming", "drought", "soil", "pest", "millet",
        "agronomy", "irrigation", "organic", "plant pathology", "biopesticides"
    ],
    "FORESTRY_ENVIRONMENT": [
        "forest", "ecology", "environment", "air quality", "biodiversity",
        "remote sensing", "carbon", "gis", "satellite", "climate"
    ],
    "WASTE_MANAGEMENT_CIRCULAR": [
        "waste", "recycling", "circular economy", "fly ash", "e-waste",
        "solid waste", "valorization", "by-product", "pollution"
    ],
    "HEALTHCARE_BIOMEDICAL": [
        "health", "medical", "telemedicine", "diagnostic", "pathogen", "clinical",
        "public health", "biomedical", "biosensors", "endemic", "microbiology"
    ],
    "RURAL_URBAN_INFRASTRUCTURE": [
        "road", "pavement", "infrastructure", "bridge", "structural", "housing",
        "urban", "rural", "transportation", "construction"
    ]
}

class TaxonomyNormalizer:
    """Normalizes raw academic topics into standardized societal challenge tokens."""

    def normalize(self, raw_text: str) -> ResearchInterestItem:
        if not raw_text:
            return ResearchInterestItem(raw="", normalized=[])

        text_lower = raw_text.lower()
        matched_tokens = set()

        for token, keywords in DOMAIN_TAXONOMY_MAP.items():
            for kw in keywords:
                # Word boundary search
                if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                    matched_tokens.add(token)
                    break

        return ResearchInterestItem(
            raw=raw_text.strip(),
            normalized=sorted(list(matched_tokens))
        )

    def normalize_list(self, raw_list: List[str]) -> List[ResearchInterestItem]:
        """Normalizes a list of raw research interest strings."""
        return [self.normalize(item) for item in raw_list if item and item.strip()]

normalizer = TaxonomyNormalizer()
