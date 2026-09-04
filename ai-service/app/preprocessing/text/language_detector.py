"""
Language & Script Detector: Identifies language, script form, and romanization status.

Distinguishes:
1. Language: 'en' (English), 'hi' (Hindi), 'sat' (Santali), 'unknown'
2. Script: 'latin', 'devanagari', 'ol_chiki', 'mixed'
3. is_romanized: True if Indic language written in Latin script (Hinglish/Romanized Hindi)
"""
import re
from typing import Dict, Any

# Common Romanized Hindi / Hinglish keywords frequently found in citizen complaints
HINGLISH_KEYWORDS = {
    "pani", "paani", "kharaab", "kharab", "problem", "samagya", "samasiya",
    "samasya", "hai", "hain", "nhi", "nahi", "rha", "raha", "rahi", "ho",
    "se", "me", "mein", "par", "ko", "ka", "ki", "ke", "hoga", "hogi",
    "gaav", "gaon", "sadak", "road", "bhi", "bahut", "bohot", "ranchi", "kanke"
}


def detect_language_and_script(text: str) -> Dict[str, Any]:
    """
    Detects language code, script type, romanization flag, and confidence.

    Args:
        text: Normalized text string.

    Returns:
        Dict with keys: language, script, is_romanized, confidence
    """
    if not text or not text.strip():
        return {
            "language": "unknown",
            "script": "mixed",
            "is_romanized": False,
            "confidence": 0.0
        }

    total_chars = len(text)
    devanagari_count = len(re.findall(r"[\u0900-\u097F]", text))
    ol_chiki_count = len(re.findall(r"[\u1C50-\u1C7F]", text))
    latin_count = len(re.findall(r"[a-zA-Z]", text))

    # Calculate script ratios
    devanagari_ratio = devanagari_count / total_chars
    ol_chiki_ratio = ol_chiki_count / total_chars
    latin_ratio = latin_count / total_chars

    # 1. Devanagari Script (Hindi)
    if devanagari_ratio > 0.3:
        return {
            "language": "hi",
            "script": "devanagari",
            "is_romanized": False,
            "confidence": round(min(devanagari_ratio * 1.5, 0.99), 2)
        }

    # 2. Ol Chiki Script (Santali)
    if ol_chiki_ratio > 0.3:
        return {
            "language": "sat",
            "script": "ol_chiki",
            "is_romanized": False,
            "confidence": round(min(ol_chiki_ratio * 1.5, 0.99), 2)
        }

    # 3. Latin Script (English OR Romanized Hindi)
    if latin_ratio > 0.3:
        words = set(re.findall(r"\b[a-zA-Z]+\b", text.lower()))
        matched_hinglish_words = words.intersection(HINGLISH_KEYWORDS)

        # If 2 or more Hinglish keywords are present, flag as Romanized Hindi
        if len(matched_hinglish_words) >= 2 or (len(words) > 0 and len(matched_hinglish_words) / len(words) >= 0.25):
            return {
                "language": "hi",
                "script": "latin",
                "is_romanized": True,
                "confidence": round(min(0.70 + (len(matched_hinglish_words) * 0.05), 0.95), 2)
            }

        return {
            "language": "en",
            "script": "latin",
            "is_romanized": False,
            "confidence": 0.98
        }

    # 4. Mixed / Unknown
    return {
        "language": "unknown",
        "script": "mixed",
        "is_romanized": False,
        "confidence": 0.50
    }
