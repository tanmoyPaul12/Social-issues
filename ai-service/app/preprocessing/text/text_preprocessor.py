"""
Text Preprocessor: Master pipeline coordinator for Text Preprocessing Layer.
Processes Title and Description independently through language-aware routing,
Romanized Hindi transliteration, IndicTrans2 NMT, heuristic quality validation,
and combined English sentence embedding.
"""
from typing import Dict, Any, Tuple
import logging

from app.api.schemas.text import ProcessedText, SingleFieldTextResult
from app.preprocessing.text.text_cleaner import clean_text
from app.preprocessing.text.language_detector import detect_language_and_script
from app.preprocessing.text.transliterator import transliterate_hinglish_to_devanagari
from app.preprocessing.text.translator import indictrans2_provider, passthrough_provider
from app.preprocessing.text.translation_quality import validate_translation_quality
from app.preprocessing.text.embedding_service import embedding_service

log = logging.getLogger(__name__)


class TextPreprocessor:
    """
    Master coordinator for independent title and description text preprocessing,
    language detection, transliteration, local NMT translation, and semantic embedding generation.
    """

    async def _process_single_field(self, raw_text: str) -> SingleFieldTextResult:
        """Processes a single text field (title or description) independently."""
        # 1. Preserve Original
        original_text = raw_text

        # 2. Conservative Text Cleaning
        normalized_text = clean_text(raw_text)

        # 3. Language and Script Detection
        lang_info = detect_language_and_script(normalized_text)
        detected_lang = lang_info["language"]
        script_type = lang_info["script"]
        is_romanized = lang_info["is_romanized"]
        confidence = lang_info["confidence"]

        # 4. English Input Route (No Translation Required)
        if detected_lang == "en" and not is_romanized:
            return SingleFieldTextResult(
                original_text=original_text,
                normalized_text=normalized_text,
                detected_language=detected_lang,
                script=script_type,
                is_romanized=is_romanized,
                language_confidence=confidence,
                translation_required=False,
                transliterated_text=None,
                english_text=normalized_text,
                translation_status="not_required",
                translation_provider=None,
                translation_error=None
            )

        # 5. Non-English or Romanized Input Route
        transliterated_text = None
        text_to_translate = normalized_text

        if is_romanized or script_type == "latin":
            transliterated = transliterate_hinglish_to_devanagari(normalized_text)
            if transliterated:
                transliterated_text = transliterated
                text_to_translate = transliterated

        # 6. Execute Translation via IndicTrans2
        try:
            raw_translation = await indictrans2_provider.translate(
                text=text_to_translate,
                source_lang=detected_lang,
                target_lang="en"
            )

            # 7. Quality Validation
            quality_check = validate_translation_quality(text_to_translate, raw_translation)

            if quality_check["is_valid"]:
                provider_name = indictrans2_provider.last_provider or "indictrans2"
                used_fallback = provider_name == "fallback"
                return SingleFieldTextResult(
                    original_text=original_text,
                    normalized_text=normalized_text,
                    detected_language=detected_lang,
                    script=script_type,
                    is_romanized=is_romanized,
                    language_confidence=confidence,
                    translation_required=True,
                    transliterated_text=transliterated_text,
                    english_text=raw_translation,
                    translation_status="fallback" if used_fallback else "completed",
                    translation_provider=provider_name,
                    translation_error=indictrans2_provider.last_error if used_fallback else None
                )
            else:
                log.warning(f"Translation quality check failed for text: '{normalized_text[:30]}...': {quality_check['reason']}")
                return SingleFieldTextResult(
                    original_text=original_text,
                    normalized_text=normalized_text,
                    detected_language=detected_lang,
                    script=script_type,
                    is_romanized=is_romanized,
                    language_confidence=confidence,
                    translation_required=True,
                    transliterated_text=transliterated_text,
                    english_text=None,
                    translation_status="failed",
                    translation_provider="indictrans2",
                    translation_error=f"Translation quality validation failed: {quality_check['reason']}"
                )

        except Exception as ex:
            log.error(f"Translation execution failed for field: {ex}")
            return SingleFieldTextResult(
                original_text=original_text,
                normalized_text=normalized_text,
                detected_language=detected_lang,
                script=script_type,
                is_romanized=is_romanized,
                language_confidence=confidence,
                translation_required=True,
                transliterated_text=transliterated_text,
                english_text=None,
                translation_status="failed",
                translation_provider="indictrans2",
                translation_error=f"Translation model could not produce a valid output: {str(ex)}"
            )

    async def process(self, title: str, description: str) -> ProcessedText:
        """
        Executes full pipeline for Title and Description independently.
        """
        # Process title and description separately
        title_res = await self._process_single_field(title)
        desc_res = await self._process_single_field(description)

        # Build combined English text
        english_parts = []
        if title_res.english_text:
            english_parts.append(title_res.english_text.rstrip("."))
        if desc_res.english_text:
            english_parts.append(desc_res.english_text)

        combined_english = ". ".join(english_parts) if english_parts else ""

        # Determine overall processing status
        title_ok = title_res.translation_status in ("completed", "not_required")
        desc_ok = desc_res.translation_status in ("completed", "not_required")

        if title_ok and desc_ok:
            overall_status = "completed"
        elif title_ok or desc_ok:
            overall_status = "completed_with_warnings"
        else:
            overall_status = "failed"

        # Internal vector embedding generation
        if combined_english:
            _ = embedding_service.generate_embedding(combined_english)

        return ProcessedText(
            title=title_res,
            description=desc_res,
            combined_english_text=combined_english,
            processing_status=overall_status
        )


text_preprocessor = TextPreprocessor()
