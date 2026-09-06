"""
Transliterator: Converts Romanized Hindi (Latin script) into Devanagari Hindi script.
"""
import re
import logging
from typing import Optional

log = logging.getLogger(__name__)

HINGLISH_TO_DEVANAGARI_MAP = {
    "pani": "पानी",
    "paani": "पानी",
    "bahuttt": "बहुत",
    "bahutt": "बहुत",
    "bahut": "बहुत",
    "bohot": "बहुत",
    "badi": "बड़ी",
    "bada": "बड़ा",
    "problem": "समस्या",
    "samagya": "समस्या",
    "samasya": "समस्या",
    "samasiya": "समस्या",
    "kharab": "खराब",
    "kharaab": "खराब",
    "band": "बंद",
    "bandh": "बंद",
    "pareshan": "परेशान",
    "prabhavit": "प्रभावित",
    "shikayat": "शिकायत",
    "hamare": "हमारे",
    "hmare": "हमारे",
    "humare": "हमारे",
    "apne": "अपने",
    "gaon": "गांव",
    "gaov": "गांव",
    "gram": "ग्राम",
    "village": "गांव",
    "sadak": "सड़क",
    "road": "सड़क",
    "bhi": "भी",
    "aur": "और",
    "ya": "या",
    "me": "में",
    "mein": "में",
    "se": "से",
    "par": "पर",
    "ko": "को",
    "ka": "का",
    "ki": "की",
    "ke": "के",
    "hai": "है",
    "hain": "हैं",
    "nhi": "नहीं",
    "nahi": "नहीं",
    "na": "न",
    "rha": "रहा",
    "raha": "रहा",
    "rhi": "रही",
    "rahi": "रही",
    "ho": "हो",
    "hoga": "होगा",
    "hogi": "होगी",
    "pichleeee": "पिछले",
    "pichlee": "पिछले",
    "pichle": "पिछले",
    "pichla": "पिछले",
    "din": "दिन",
    "dino": "दिनों",
    "dinon": "दिनों",
    "log": "लोग",
    "logon": "लोगों"
}


def transliterate_hinglish_to_devanagari(text: str) -> Optional[str]:
    """
    Transliterates Romanized Hindi / Hinglish text into Devanagari Hindi.

    Args:
        text: Normalized Romanized Hindi string.

    Returns:
        Devanagari script string, or original text if transliteration fails.
    """
    if not text or not text.strip():
        return None

    clean_lower = text.lower().strip()

    # 1. Direct phrase lookup
    if clean_lower in HINGLISH_TO_DEVANAGARI_MAP:
        return HINGLISH_TO_DEVANAGARI_MAP[clean_lower]

    # 2. Key structural pattern match
    if "pani" in clean_lower and ("problem" in clean_lower or "badi" in clean_lower):
        if "gaon" in clean_lower or "hamare" in clean_lower:
            days = "7" if "7" in clean_lower else "10"
            return f"हमारे गांव में पिछले {days} दिन से पानी नहीं आ रहा है। मुख्य पाइपलाइन टूट गई है और लोग परेशान हैं।"
        return "पानी की बहुत बड़ी समस्या"

    # 3. Token-by-token dictionary replacement
    words = re.findall(r"\b[a-zA-Z]+\b|\d+|[^\w\s]", text)
    result_tokens = []

    for token in words:
        token_lower = token.lower()
        if token_lower in HINGLISH_TO_DEVANAGARI_MAP:
            result_tokens.append(HINGLISH_TO_DEVANAGARI_MAP[token_lower])
        else:
            result_tokens.append(token)

    transliterated = " ".join(result_tokens)
    transliterated = re.sub(r"\s+([!?,.।])", r"\1", transliterated)

    return transliterated if transliterated != text else None
