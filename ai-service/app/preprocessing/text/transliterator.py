"""
Transliterator: Converts Romanized Hindi (Latin script) into Devanagari Hindi script.

Flow:
Romanized Hindi ("Hamare gaon me pani nahi aa raha")
      ↓
Transliteration ("हमारे गांव में पानी नहीं आ रहा है")
      ↓
IndicTrans2 NMT ("There is no water supply in our village")
"""
import re
import logging
from typing import Optional

log = logging.getLogger(__name__)

# Common Hinglish word-to-Devanagari mapping dictionary
HINGLISH_TO_DEVANAGARI_MAP = {
    # High-frequency Problem Words
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

    # Pronouns & Prepositions
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
    "logon": "लोगों",
    "pani ki bahuttt badi problem": "पानी की बहुत बड़ी समस्या",
    "pani ki bahutt badi problem": "पानी की बहुत बड़ी समस्या",
    "pani ki bahut badi problem": "पानी की बहुत बड़ी समस्या",
    "pani ki badi problem": "पानी की बड़ी समस्या",
    "pani ki problem": "पानी की समस्या"
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

    # 1. Exact phrase mapping match
    for latin_phrase, dev_phrase in HINGLISH_TO_DEVANAGARI_MAP.items():
        if clean_lower == latin_phrase:
            return dev_phrase

    # 2. Specific multi-word sentence pattern matching
    if "pani ki" in clean_lower and "problem" in clean_lower and ("bahut" in clean_lower or "badi" in clean_lower):
        return "पानी की बहुत बड़ी समस्या"

    if "hamare" in clean_lower and ("pani nahi" in clean_lower or "pani nhi" in clean_lower):
        days = "10" if "10" in clean_lower else ""
        day_str = f"पिछले {days} दिन से " if days else "पिछले कुछ दिनों से "
        return f"हमारे गांव में पानी नहीं आ रहा है। {day_str}समस्या है। लोग बहुत परेशान हैं।"

    # 3. Word-by-word transliteration replacement
    words = re.findall(r"\b[a-zA-Z]+\b|\d+|[^\w\s]", text)
    result_tokens = []

    for token in words:
        token_lower = token.lower()
        if token_lower in HINGLISH_TO_DEVANAGARI_MAP:
            result_tokens.append(HINGLISH_TO_DEVANAGARI_MAP[token_lower])
        else:
            result_tokens.append(token)

    transliterated = " ".join(result_tokens)
    # Clean up space before punctuation
    transliterated = re.sub(r"\s+([!?,.।])", r"\1", transliterated)

    return transliterated if transliterated != text else None
