"""
Translation Quality Validator Sub-Module.
Validates machine translation outputs to guarantee zero residual Indic scripts (Devanagari, Bengali)
and minimum English token purity for Hinglish/multilingual document translations.
"""
import re
import logging
from typing import Tuple, Dict, Any

log = logging.getLogger(__name__)

# Regular expressions for non-English scripts
DEVANAGARI_REGEX = re.compile(r'[\u0900-\u097F]')
BENGALI_REGEX = re.compile(r'[\u0980-\u09FF]')
OL_CHIKI_REGEX = re.compile(r'[\u1C50-\u1C7F]')

# Common Hinglish residual keywords that indicate incomplete translation
HINGLISH_RESIDUAL_WORDS = {
    "mein", "hain", "parantu", "lekin", "wajah", "vajah", "isliye",
    "pichhle", "pichle", "hafton", "lagbhag", "unhe", "unko", "humko",
    "isne", "unhone", "raha", "rahi", "rahe", "gaya", "ho", "tha", "thi"
}


def validate_translation_quality(
    original_text: str,
    translated_text: str,
    source_lang: str = "hi"
) -> Tuple[bool, str, float]:
    """
    Validates machine translation output quality.
    Returns (is_valid, reason, quality_score_0_to_1).
    """
    if not translated_text or not translated_text.strip():
        return False, "Translation output is empty.", 0.0

    text_clean = translated_text.strip()

    # 1. Script Purity Check: Reject any output containing Devanagari or Bengali characters when target is English
    if DEVANAGARI_REGEX.search(text_clean):
        log.warning(f"Translation Quality Check Failed: Output contains Devanagari characters: '{text_clean[:60]}...'")
        return False, "Contains untranslated Devanagari script.", 0.2

    if BENGALI_REGEX.search(text_clean):
        log.warning(f"Translation Quality Check Failed: Output contains Bengali characters: '{text_clean[:60]}...'")
        return False, "Contains untranslated Bengali script.", 0.2

    # 2. Hinglish Residual Word Check for Romanized Hindi / Hinglish inputs
    words = re.findall(r'\b[a-zA-Z]+\b', text_clean.lower())
    if not words:
        return False, "No valid English words found in translation.", 0.0

    residual_count = sum(1 for w in words if w in HINGLISH_RESIDUAL_WORDS)
    residual_ratio = residual_count / len(words)

    if residual_ratio > 0.15:
        log.warning(
            f"Translation Quality Check Failed: High Hinglish residual ratio ({residual_ratio:.2%}) "
            f"in translated text: '{text_clean[:60]}...'"
        )
        return False, f"Contains {residual_count} untranslated Hinglish words ({residual_ratio:.1%} of text).", 0.4

    # 3. Degenerate Output Check (Exact copy of non-English original)
    if source_lang != "en" and original_text.strip().lower() == text_clean.lower() and len(words) > 5:
        return False, "Translation output is identical to non-English input (passthrough failure).", 0.3

    quality_score = max(0.5, 1.0 - residual_ratio * 2)
    return True, "Valid English translation.", round(quality_score, 2)
