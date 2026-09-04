"""
Domain Text Preprocessor Orchestrator.
Coordinates: Clean -> Detect Language -> Transliterate Hinglish -> Translate -> Normalize.
"""
import logging
from typing import Optional, Dict, Any, Tuple

from app.domain.preprocessing.text_cleaner import clean_text
from app.domain.preprocessing.language_detector import detect_language_and_script
from app.domain.preprocessing.transliterator import transliterate_hinglish_to_devanagari
from app.core.config import settings
from app.ml.translation.base import TranslationProvider
from app.ml.translation.indictrans2_provider import indictrans2_provider
from app.ml.translation.cloud_provider import gemini_provider
from app.ml.translation.mock_provider import MockTranslator
from app.api.schemas.text import ProcessedText, SingleFieldTextResult

log = logging.getLogger(__name__)


from app.ml.translation.nvidia_provider import nvidia_provider

def get_default_provider() -> TranslationProvider:
    provider_type = getattr(settings, "TRANSLATION_PROVIDER", "nvidia").lower()
    if provider_type == "nvidia" or getattr(settings, "NVIDIA_API_KEY", "").startswith("nvapi-"):
        log.info("Using NVIDIA NIM Cloud Translation Provider.")
        return nvidia_provider
    elif provider_type == "mock":
        log.info("Using Mock Translation Provider.")
        return MockTranslator()
    elif provider_type == "cloud" or getattr(settings, "GEMINI_API_KEY", ""):
        log.info("Using Gemini Cloud Translation Provider.")
        return gemini_provider
    log.info("Using Passthrough Translation Fallback Provider.")
    return indictrans2_provider


class DomainTextPreprocessor:
    """
    Domain Orchestrator for Text Preprocessing.
    Cleanly decoupled from ML translation provider implementation.
    """

    def __init__(self, translator: Optional[TranslationProvider] = None):
        self.translator = translator or get_default_provider()

    async def process_field(
        self,
        raw_text: str,
        field_name: str
    ) -> Tuple[SingleFieldTextResult, Dict[str, Any]]:
        """
        Processes a single text field (title or description).
        """
        if not raw_text or not raw_text.strip():
            empty_proc = SingleFieldTextResult(
                original_text="",
                normalized_text="",
                detected_language="unknown",
                script="mixed",
                is_romanized=False,
                language_confidence=0.0,
                translation_required=False,
                transliterated_text=None,
                english_text="",
                translation_status="skipped",
                translation_provider=None,
                translation_error=None
            )
            return empty_proc, {"language": "unknown", "script": "mixed", "is_romanized": False, "confidence": 0.0}

        # 1. Conservative Cleaning & NFKC Normalization
        norm_text = clean_text(raw_text)

        # 2. Language & Script Detection
        lang_info = detect_language_and_script(norm_text)
        detected_lang = lang_info["language"]
        script = lang_info["script"]
        is_romanized = lang_info["is_romanized"]
        confidence = lang_info["confidence"]

        # 3. Handle English (Early Return - Skip Translation Overhead)
        if detected_lang == "en":
            processed = SingleFieldTextResult(
                original_text=raw_text,
                normalized_text=norm_text,
                detected_language="en",
                script="latin",
                is_romanized=False,
                language_confidence=confidence,
                translation_required=False,
                transliterated_text=None,
                english_text=norm_text,
                translation_status="skipped",
                translation_provider="passthrough",
                translation_error=None
            )
            return processed, lang_info

        # 4. Handle Hinglish / Romanized Hindi Transliteration
        text_to_translate = norm_text
        transliterated_text = None
        if is_romanized and script == "latin":
            transliterated = transliterate_hinglish_to_devanagari(norm_text)
            if transliterated:
                text_to_translate = transliterated
                transliterated_text = transliterated
                log.info(f"Transliterated Hinglish field '{field_name}' to Devanagari: '{transliterated}'")

        # 5. Translation Execution via ML Translation Provider Interface
        english_text = norm_text
        translation_status = "completed"
        translation_error = None

        try:
            english_text = await self.translator.translate(
                text=text_to_translate,
                source_lang=detected_lang,
                target_lang="en"
            )
            if english_text != norm_text:
                translation_status = "completed"
            elif detected_lang != "en":
                translation_status = "completed"
        except Exception as e:
            log.error(f"Translation failed for field '{field_name}': {e}", exc_info=True)
            translation_status = "failed"
            translation_error = str(e)

        processed = SingleFieldTextResult(
            original_text=raw_text,
            normalized_text=norm_text,
            detected_language=detected_lang,
            script=script,
            is_romanized=is_romanized,
            language_confidence=confidence,
            translation_required=True,
            transliterated_text=transliterated_text,
            english_text=english_text,
            translation_status=translation_status,
            translation_provider=settings.TRANSLATION_PROVIDER,
            translation_error=translation_error
        )
        return processed, lang_info

    async def process(
        self,
        title: str,
        description: str
    ) -> ProcessedText:
        """
        Orchestrates full processing pipeline for title and description.
        """
        proc_title, title_lang = await self.process_field(title, "title")
        proc_desc, desc_lang = await self.process_field(description, "description")

        combined_eng = f"{proc_title.english_text}. {proc_desc.english_text}".strip()

        # Determine overall pipeline status
        status = "completed"
        if proc_title.translation_status == "failed" or proc_desc.translation_status == "failed":
            status = "partial_failure"

        return ProcessedText(
            title=proc_title,
            description=proc_desc,
            combined_english_text=combined_eng,
            processing_status=status
        )


# Global Domain Preprocessor Instance
text_preprocessor = DomainTextPreprocessor()
