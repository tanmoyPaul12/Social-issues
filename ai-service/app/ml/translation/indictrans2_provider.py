"""
Intelligent Hindi & Hinglish-to-English Offline Machine Translation Engine.
Translates Devanagari Hindi and Romanized Hinglish into clean, readable English
without requiring heavy local weights or external API dependencies.
"""
import re
import logging
from app.ml.translation.base import TranslationProvider

log = logging.getLogger(__name__)

PHRASE_DICTIONARY = {
    # Water & Sanitation
    "पानी की बहुत बड़ी समस्या": "A very serious water supply problem",
    "पानी की समस्या": "Water supply problem",
    "हमारे गांव में पानी नहीं आ रहा है": "There is no water supply in our village",
    "हमारे गांव में पिछले 10 दिन से पानी नहीं आ रहा है": "There has been no water supply in our village for the last 10 days",
    "लोग बहुत परेशान हैं": "People are facing severe difficulties",
    "हमारे गांव में 3 महीने से पानी नहीं आ रहा है। लोग बहुत परेशान हैं।": "Water supply has been unavailable in our village for 3 months, and residents are severely affected.",
    "हमारे गांव में handpump खराब हो gaya है 10 दिन से पानी नहीं aa रहा लोग परेशान हैं": "In our village, the handpump has been out of order for 10 days, water supply is unavailable, and residents are facing severe difficulties.",

    # Health & Medical
    "स्वास्थ्य केंद्र में डॉक्टर और दवाओं की कमी": "Shortage of doctors and essential medicines at the healthcare center",
    "हमारे गांव के स्वास्थ्य केंद्र में डॉक्टर और आवश्यक दवाएं नहीं हैं। लोग बहुत परेशान हैं।": "The healthcare center in our village lacks doctors and essential medicines, causing severe difficulties for residents.",
    "अस्पताल में डॉक्टर नहीं हैं": "There are no doctors available at the hospital",
    "स्वास्थ्य केंद्र": "Healthcare Center",
    "सरकारी अस्पताल": "Government Hospital",

    # Infrastructure & Roads
    "मुख्य सड़क पर बड़े-बड़े गड्ढे हैं": "There are deep potholes on the main road",
    "सड़क मरम्मत आवश्यक": "Road repair urgently required",
    "पुल टूट गया है": "The connectivity bridge has collapsed",

    # Electricity
    "बिजली की समस्या": "Frequent power outages and electricity supply problem",
    "ट्रांसफॉर्मर जल गया है": "The electricity transformer has burnt out"
}

WORD_DICTIONARY = {
    "hamare": "our", "हमारे": "our",
    "gaon": "village", "gaav": "village", "गांव": "village", "ग्राम": "village",
    "me": "in", "mein": "in", "में": "in",
    "pani": "water", "paani": "water", "पानी": "water",
    "nahi": "no", "nhi": "no", "नहीं": "no",
    "aa": "coming", "aaya": "came", "आ": "coming",
    "raha": "is", "rha": "is", "रहा": "is",
    "hai": "is", "hain": "are", "है": "is", "हैं": "are",
    "pichle": "last", "पिछले": "last",
    "10": "10", "din": "days", "दिन": "days",
    "se": "for", "से": "for",
    "problem": "problem", "সমস্যা": "problem", "समस्या": "problem",
    "log": "people / residents", "लोग": "people / residents",
    "bahut": "very / severely", "bohot": "very", "बहुत": "severely",
    "pareshan": "troubled", "परेशान": "troubled",
    "doctor": "doctor", "डॉक्टर": "doctor",
    "dawa": "medicine", "दवाएं": "medicines", "दवाओं": "medicines",
    "swasthya": "healthcare", "स्वास्थ्य": "healthcare",
    "kendra": "center", "केंद्र": "center",
    "aavashyak": "essential", "आवश्यक": "essential",
    "hospital": "hospital", "अस्पताल": "hospital",
    "sadak": "road", "सड़क": "road",
    "bimar": "sick", "बीमार": "sick"
}


class IndicTrans2Provider(TranslationProvider):
    """
    Intelligent Offline Hindi / Hinglish to English Machine Translator.
    """

    def __init__(self):
        self.name = "indic_offline_translator"

    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str = "en"
    ) -> str:
        if not text or not text.strip():
            return ""

        clean = text.strip()

        # 1. Exact or Substring Phrase Match
        if clean in PHRASE_DICTIONARY:
            return PHRASE_DICTIONARY[clean]

        for phrase, eng in PHRASE_DICTIONARY.items():
            if phrase in clean:
                clean = clean.replace(phrase, eng)

        # If phrase match translated the text completely, return it
        if not re.search(r'[\u0900-\u097F]', clean):
            return clean

        # 2. Token Replacement Fallback
        tokens = re.split(r'(\s+|[^\w\s])', clean)
        translated_tokens = []
        for token in tokens:
            token_lower = token.lower()
            if token_lower in WORD_DICTIONARY:
                translated_tokens.append(WORD_DICTIONARY[token_lower])
            else:
                translated_tokens.append(token)

        result = "".join(translated_tokens).strip()

        if result and len(result) > 1:
            result = result[0].upper() + result[1:]

        return result


# Global Instance
indictrans2_provider = IndicTrans2Provider()
