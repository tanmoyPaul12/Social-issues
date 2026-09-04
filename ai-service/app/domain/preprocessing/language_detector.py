"""
Language & Script Detector: English, Hindi, Hinglish, Bengali, and Santali (Ol Chiki).
Detects native Unicode script ranges and romanization flags for grassroots submissions.
"""
import re
from typing import Dict, Any

HINGLISH_KEYWORDS = {
    "pani", "paani", "kharaab", "kharab", "samasiya", "samasya", "hai", "hain",
    "nhi", "nahi", "rha", "raha", "rahi", "ho", "se", "me", "mein", "par", "ko",
    "ka", "ki", "ke", "hoga", "hogi", "gaav", "gaon", "sadak", "bhi", "bahut",
    "bohot", "log", "pareshan", "pichle", "din", "bimar", "dawa", "kare", "karo",
    "chahiye", "aaye", "aaya", "aala", "rahe", "gaye", "hua", "huye"
}

BENGLISH_KEYWORDS = {
    "jol", "joler", "rasta", "somosya", "khoob", "khub", "shomosya",
    "dorkar", "khobor", "bhabe", "asche", "na", "gramer", "nodi",
    "hospital", "paniye", "karon", "kharap"
}


def detect_language_and_script(text: str) -> Dict[str, Any]:
    """
    Detects language code (en, hi, bn, sat), script type (latin, devanagari, bengali, ol_chiki),
    romanization flag, and confidence.
    """
    if not text or not text.strip():
        return {
            "language": "unknown",
            "script": "latin",
            "is_romanized": False,
            "confidence": 0.0
        }

    total_chars = len(text)
    ol_chiki_count = len(re.findall(r"[\u1C50-\u1C7F]", text))
    bengali_count = len(re.findall(r"[\u0980-\u09FF]", text))
    devanagari_count = len(re.findall(r"[\u0900-\u097F]", text))
    latin_count = len(re.findall(r"[a-zA-Z]", text))

    ol_chiki_ratio = ol_chiki_count / total_chars if total_chars > 0 else 0.0
    bengali_ratio = bengali_count / total_chars if total_chars > 0 else 0.0
    devanagari_ratio = devanagari_count / total_chars if total_chars > 0 else 0.0
    latin_ratio = latin_count / total_chars if total_chars > 0 else 0.0

    # 1. Santali (Ol Chiki Script)
    if ol_chiki_ratio > 0.15:
        return {
            "language": "sat",
            "script": "ol_chiki",
            "is_romanized": False,
            "confidence": round(min(0.85 + (ol_chiki_ratio * 0.15), 0.99), 2)
        }

    # 2. Bengali Script
    if bengali_ratio > 0.15:
        return {
            "language": "bn",
            "script": "bengali",
            "is_romanized": False,
            "confidence": round(min(0.85 + (bengali_ratio * 0.15), 0.99), 2)
        }

    # 3. Devanagari Script (Hindi)
    if devanagari_ratio > 0.15:
        return {
            "language": "hi",
            "script": "devanagari",
            "is_romanized": False,
            "confidence": round(min(0.85 + (devanagari_ratio * 0.15), 0.99), 2)
        }

    # 4. Latin Script (English, Hinglish, or Benglish)
    if latin_ratio > 0.15:
        words = set(re.findall(r"\b[a-zA-Z]+\b", text.lower()))
        hinglish_matches = words.intersection(HINGLISH_KEYWORDS)
        benglish_matches = words.intersection(BENGLISH_KEYWORDS)

        if len(benglish_matches) >= 2 or (len(words) > 0 and len(benglish_matches) / len(words) >= 0.15):
            return {
                "language": "bn",
                "script": "latin",
                "is_romanized": True,
                "confidence": round(min(0.75 + (len(benglish_matches) * 0.05), 0.96), 2)
            }

        if len(hinglish_matches) >= 2 or (len(words) > 0 and len(hinglish_matches) / len(words) >= 0.15):
            return {
                "language": "hi",
                "script": "latin",
                "is_romanized": True,
                "confidence": round(min(0.75 + (len(hinglish_matches) * 0.05), 0.96), 2)
            }

        return {
            "language": "en",
            "script": "latin",
            "is_romanized": False,
            "confidence": 0.98
        }

    return {
        "language": "en",
        "script": "latin",
        "is_romanized": False,
        "confidence": 0.50
    }
