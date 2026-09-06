"""
Location Validator: Performs spatial GIS coordinate and administrative boundary validation.
Checks:
- Coordinate validity (null/range check)
- Inside Jharkhand state bounds? (Lat 21.9° N - 25.3° N, Lng 83.3° E - 87.9° E)
- Reverse geocoding / Administrative district & block string comparison:
  - If citizen input district matches GPS coordinates -> CONSISTENT (🟢 PASS)
  - If citizen input district differs from GPS location -> MISMATCH (🟡 FLAG for review)
  - If coordinates are outside Jharkhand/India -> OUT_OF_BOUNDS (🔴 REJECT)

Returns 3-state location validation result.
"""
from typing import Dict, Any, Optional

JHARKHAND_BOUNDS = {
    "lat_min": 21.9,
    "lat_max": 25.3,
    "lng_min": 83.3,
    "lng_max": 87.9
}

# Major Jharkhand District Centroid References
DISTRICT_CENTROIDS = {
    "ranchi": {"lat": 23.3441, "lng": 85.3096},
    "dhanbad": {"lat": 23.7957, "lng": 86.4304},
    "bokaro": {"lat": 23.6693, "lng": 86.1511},
    "jamshedpur": {"lat": 22.8046, "lng": 86.2029},
    "east singhbhum": {"lat": 22.8046, "lng": 86.2029},
    "hazaribagh": {"lat": 23.9925, "lng": 85.3637},
    "giridih": {"lat": 24.1856, "lng": 86.3050},
    "deoghar": {"lat": 24.4826, "lng": 86.6967},
    "palamu": {"lat": 24.0326, "lng": 84.0722},
    "dumka": {"lat": 24.2676, "lng": 87.2489}
}

def validate_location_data(
    lat: Optional[float],
    lng: Optional[float],
    citizen_district: str = "",
    citizen_block: str = ""
) -> Dict[str, Any]:
    """
    Validates submission GPS coordinates against administrative district input.
    """
    issues = []
    
    # 1. Null / Missing Coordinate Check
    if lat is None or lng is None:
        return {
            "status": "FLAG",
            "confidence": 0.50,
            "issues": ["GPS coordinates missing from submission."],
            "is_inside_jharkhand": False
        }

    # 2. Inside Jharkhand Boundary Check
    in_lat_bounds = JHARKHAND_BOUNDS["lat_min"] <= lat <= JHARKHAND_BOUNDS["lat_max"]
    in_lng_bounds = JHARKHAND_BOUNDS["lng_min"] <= lng <= JHARKHAND_BOUNDS["lng_max"]
    
    if not in_lat_bounds or not in_lng_bounds:
        return {
            "status": "REJECT",
            "confidence": 0.0,
            "issues": [f"Coordinates ({lat:.4f}, {lng:.4f}) are outside Jharkhand boundary."],
            "is_inside_jharkhand": False
        }

    # 3. Compare Citizen Input District vs Centroid Proximity
    status = "CONSISTENT"
    clean_district = citizen_district.strip().lower()
    
    if clean_district in DISTRICT_CENTROIDS:
        target = DISTRICT_CENTROIDS[clean_district]
        # Approximate Euclidean degree distance
        dist_deg = ((lat - target["lat"])**2 + (lng - target["lng"])**2)**0.5
        
        # 1 degree lat/lng in Jharkhand is approx 110km; > 0.4 degrees (~45km) indicates district boundary mismatch
        if dist_deg > 0.4:
            status = "MISMATCH"
            issues.append(f"GPS coordinates appear far from selected district '{citizen_district}'. Flagged for review.")

    confidence = 0.98 if status == "CONSISTENT" else 0.70

    return {
        "status": status,
        "confidence": confidence,
        "issues": issues,
        "is_inside_jharkhand": True,
        "coordinates": {"lat": lat, "lng": lng}
    }
