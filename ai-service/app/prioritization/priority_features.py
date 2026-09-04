"""
Priority Feature Extractor: Extracts impact features from challenge payload.
"""
from typing import Dict, Any

def extract_priority_features(challenge_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Extracts numerical features used for impact prediction."""
    return {
        "has_gps": challenge_dict.get("latitude") is not None,
        "affected_pop": challenge_dict.get("affected_population") or 0,
        "user_priority": challenge_dict.get("priority", "MEDIUM"),
        "attachment_count": len(challenge_dict.get("attachments", []))
    }
