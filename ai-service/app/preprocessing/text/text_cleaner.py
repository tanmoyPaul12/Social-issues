"""
Text Cleaner: Conservative Unicode normalization and whitespace cleanup.

Rules:
1. Performs NFKC Unicode normalization to unify character representations.
2. Removes invisible zero-width characters (mobile keyboard artifacts).
3. Collapses horizontal whitespace while preserving paragraph line breaks.
4. Conservatively preserves all words, numbers, place names, and punctuation.
"""
import re
import unicodedata

# Invisible zero-width characters commonly inserted by mobile keyboards / copy-pastes
ZERO_WIDTH_PATTERN = re.compile(r"[\u200b\u200c\u200d\u200e\u200f\ufeff\u202a-\u202e]")
# Horizontal whitespace (spaces, tabs, non-breaking spaces)
HORIZONTAL_SPACE_PATTERN = re.compile(r"[^\S\r\n]+")
# Excessive vertical line breaks (more than 2 consecutive newlines)
VERTICAL_BREAK_PATTERN = re.compile(r"(\r?\n){3,}")


def clean_text(text: str) -> str:
    """
    Conservatively cleans raw text from citizen submissions.

    Args:
        text: Raw text string submitted by citizen.

    Returns:
        Cleaned, normalized text string with original meaning preserved.
    """
    if not text:
        return ""

    # 1. Unicode NFKC Normalization
    normalized = unicodedata.normalize("NFKC", text)

    # 2. Strip invisible zero-width characters
    cleaned = ZERO_WIDTH_PATTERN.sub("", normalized)

    # 3. Collapse multiple horizontal spaces per line
    lines = cleaned.splitlines()
    cleaned_lines = [HORIZONTAL_SPACE_PATTERN.sub(" ", line).strip() for line in lines]
    cleaned = "\n".join(cleaned_lines)

    # 4. Limit excessive consecutive blank lines to max 2
    cleaned = VERTICAL_BREAK_PATTERN.sub("\n\n", cleaned)

    return cleaned.strip()
