"""
Translation Quality Validator: Quality guardrails to detect empty outputs, severe truncation,
or hallucination loops in translation model outputs.
"""
from typing import Dict, Any


def validate_translation_quality(source_text: str, translated_text: str) -> Dict[str, Any]:
    """
    Validates quality of translated text output against source text.

    Args:
        source_text: Original input text string.
        translated_text: Translated target text string.

    Returns:
        Dict with keys: is_valid (bool), quality_score (float), reason (str)
    """
    source_clean = source_text.strip()
    target_clean = translated_text.strip()

    # 1. Source was empty
    if not source_clean:
        return {
            "is_valid": True,
            "quality_score": 1.0,
            "reason": "Empty source text."
        }

    # 2. Empty output check
    if not target_clean:
        return {
            "is_valid": False,
            "quality_score": 0.0,
            "reason": "Translation output is empty or whitespace only."
        }

    # 3. Extreme length truncation check (e.g. source >= 40 chars, target < 5 chars)
    if len(source_clean) >= 40 and len(target_clean) < 5:
        return {
            "is_valid": False,
            "quality_score": 0.2,
            "reason": f"Severe length truncation: source length {len(source_clean)} vs target length {len(target_clean)}."
        }

    # 4. Repeated word loop hallucination check (e.g. same single word repeated > 5 times)
    words = target_clean.lower().split()
    if len(words) >= 6 and len(set(words)) == 1:
        return {
            "is_valid": False,
            "quality_score": 0.1,
            "reason": f"Hallucination loop detected: repeated word '{words[0]}'."
        }

    # 5. Valid translation
    return {
        "is_valid": True,
        "quality_score": 0.95,
        "reason": "Translation quality check passed."
    }
