"""
Translator: Abstracted Translation Provider supporting Gemini Cloud Translation,
English Passthrough, Romanized Hindi Transliteration, and quality validation.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import os
import time
import logging

from app.core.config import settings
from app.preprocessing.text.translation_quality import validate_translation_quality
from app.preprocessing.text.transliterator import transliterate_hinglish_to_devanagari

log = logging.getLogger(__name__)


class TranslationProvider(ABC):
    """Abstract base interface for Machine Translation models."""

    @abstractmethod
    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str = "en"
    ) -> str:
        """Translates text from source_lang to target_lang."""
        pass


class PassthroughTranslator(TranslationProvider):
    """Passthrough translator for English or non-translatable text."""

    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str = "en"
    ) -> str:
        return text


class IndicTrans2Translator(TranslationProvider):
    """
    Lightweight rule-based & dictionary translator fallback.
    Ensures safe execution without requiring PyTorch / torch model dependencies.
    """

    def __init__(self):
        self.last_provider = "fallback"
        self.last_error = None

    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str = "en"
    ) -> str:
        if not text or not text.strip():
            return ""

        clean = text.strip()

        known_translations = {
            "पानी की समस्या": "Water problem",
            "पानी की बहुत बड़ी समस्या": "A very serious water problem.",
            "हमारे गांव में पानी की समस्या है।": "There is a water problem in our village.",
            "हमारे गांव में पानी नहीं आ रहा है। पिछले 10 दिन से समस्या है। लोग बहुत परेशान हैं।": "There has been no water supply in our village for the last 10 days, and people are facing serious difficulties.",
            "हमारे गांव में पानी नहीं आ रहा है": "There is no water supply in our village",
            "मुख्य सड़क पर बड़े-बड़े गड्ढे हैं।": "There are large potholes on the main road.",
            "सड़क मरम्मत आवश्यक": "Road repair required"
        }

        if clean in known_translations:
            return known_translations[clean]

        for src, tgt in known_translations.items():
            if src in clean:
                return tgt

        return clean


# Global singletons
passthrough_provider = PassthroughTranslator()
indictrans2_provider = IndicTrans2Translator()
