"""
Location Processor & Geocoding Verification.
Validates GPS coordinates and verifies location context against Jharkhand's 24 administrative districts,
including Hindi Devanagari district name normalization.
"""
import logging
from typing import Dict, Any, Optional

log = logging.getLogger(__name__)

JHARKHAND_DISTRICTS = [
    "Ranchi", "Dhanbad", "East Singhbhum", "West Singhbhum", "Hazaribagh",
    "Bokaro", "Dumka", "Giridih", "Deoghar", "Ramgarh", "Palamu", "Garhwa",
    "Chatra", "Koderma", "Jamtara", "Godda", "Sahibganj", "Pakur", "Latehar",
    "Lohardaga", "Gumla", "Simdega", "Khunti", "Seraikela Kharsawan"
]

HINDI_DISTRICT_MAP = {
    "रांची": "Ranchi",
    "धनबाद": "Dhanbad",
    "पूर्वी सिंहभूम": "East Singhbhum",
    "पश्चिमी सिंहभूम": "West Singhbhum",
    "हजारीबाग": "Hazaribagh",
    "बोकारो": "Bokaro",
    "दुमका": "Dumka",
    "गिरिडीह": "Giridih",
    "देवघर": "Deoghar",
    "रामगढ़": "Ramgarh",
    "पलामू": "Palamu",
    "गढ़वा": "Garhwa",
    "चतरा": "Chatra",
    "कोडरमा": "Koderma",
    "जामताड़ा": "Jamtara",
    "गोड्डा": "Godda",
    "साहिबगंज": "Sahibganj",
    "पाकुड़": "Pakur",
    "लातेहार": "Latehar",
    "लोहरदगा": "Lohardaga",
    "गुमला": "Gumla",
    "सिमडेगा": "Simdega",
    "खूंटी": "Khunti",
    "सरायकेला खरसावां": "Seraikela Kharsawan"
}

# Approximate Jharkhand State Bounding Box
JHARKHAND_LAT_MIN, JHARKHAND_LAT_MAX = 21.9, 25.4
JHARKHAND_LON_MIN, JHARKHAND_LON_MAX = 83.3, 87.9


class LocationProcessor:
    """
    Deterministic GPS & Geocoding Location Processor.
    """

    def process_location(
        self,
        latitude: Optional[float],
        longitude: Optional[float],
        district: Optional[str] = None,
        block: Optional[str] = None,
        gram_panchayat: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Validates coordinates and cross-references location context.
        """
        if latitude is None or longitude is None:
            return {
                "is_valid": False,
                "error_message": "GPS coordinates (latitude/longitude) missing.",
                "latitude": None,
                "longitude": None,
                "district": district,
                "block": block,
                "gram_panchayat": gram_panchayat,
                "is_in_jharkhand": False,
                "conflict_detected": False
            }

        clean_district = district.strip() if district else None
        clean_block = block.strip() if block else None
        clean_gp = gram_panchayat.strip() if gram_panchayat else None

        # Translate Devanagari Hindi district to English standard name if applicable
        if clean_district and clean_district in HINDI_DISTRICT_MAP:
            clean_district = HINDI_DISTRICT_MAP[clean_district]

        # 1. Bounds Validation
        if not (-90.0 <= latitude <= 90.0) or not (-180.0 <= longitude <= 180.0):
            return {
                "is_valid": False,
                "error_message": f"Coordinates ({latitude}, {longitude}) out of global bounds.",
                "latitude": latitude,
                "longitude": longitude,
                "district": clean_district,
                "block": clean_block,
                "gram_panchayat": clean_gp,
                "is_in_jharkhand": False,
                "conflict_detected": True
            }

        if latitude == 0.0 and longitude == 0.0:
            return {
                "is_valid": False,
                "error_message": "Invalid null island (0.0, 0.0) coordinates.",
                "latitude": latitude,
                "longitude": longitude,
                "district": clean_district,
                "block": clean_block,
                "gram_panchayat": clean_gp,
                "is_in_jharkhand": False,
                "conflict_detected": True
            }

        # 2. Jharkhand Bounding Check
        is_in_jharkhand = (JHARKHAND_LAT_MIN <= latitude <= JHARKHAND_LAT_MAX) and (JHARKHAND_LON_MIN <= longitude <= JHARKHAND_LON_MAX)

        # 3. District Match & Conflict Detection
        matched_district = clean_district
        conflict_detected = False

        if clean_district:
            normalized_dist = clean_district.title()
            matches = [d for d in JHARKHAND_DISTRICTS if d.lower() in normalized_dist.lower() or normalized_dist.lower() in d.lower()]
            if matches:
                matched_district = matches[0]
            else:
                if is_in_jharkhand:
                    log.warning(f"Submitted district '{clean_district}' not found in standard 24 Jharkhand districts.")
                    conflict_detected = True

        return {
            "is_valid": True,
            "error_message": None,
            "latitude": latitude,
            "longitude": longitude,
            "district": matched_district or ("Ranchi" if is_in_jharkhand else None),
            "block": clean_block,
            "gram_panchayat": clean_gp,
            "is_in_jharkhand": is_in_jharkhand,
            "conflict_detected": conflict_detected
        }


# Global Location Processor Instance
location_processor = LocationProcessor()
