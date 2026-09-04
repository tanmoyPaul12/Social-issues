"""
NVIDIA NIM Translation Provider.
High-accuracy machine translation using NVIDIA NIM API endpoint
supporting English, Hindi, Hinglish, Bengali, and Santali (Ol Chiki).
"""
import urllib.request
import json
import logging
import asyncio
from typing import Optional

from app.ml.translation.base import TranslationProvider
from app.core.config import settings

log = logging.getLogger(__name__)

from app.domain.preprocessing.translation_validator import validate_translation_quality

NVIDIA_TRANSLATE_MODELS = [
    getattr(settings, "NVIDIA_TRANSLATE_MODEL", "meta/llama-3.2-11b-vision-instruct"),
    "google/diffusiongemma-26b-a4b-it"
]


class NvidiaTranslationProvider(TranslationProvider):
    """
    NVIDIA NIM API Machine Translation Provider.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or getattr(settings, "NVIDIA_API_KEY", "")

    def _translate_sync(self, text: str, source_lang: str, target_lang: str) -> str:
        if not text or not text.strip():
            return ""

        if source_lang == "en" and not getattr(settings, "FORCE_TRANSLATE_ENGLISH", False):
            return text.strip()

        if not self.api_key or not self.api_key.startswith("nvapi-"):
            log.warning("NVIDIA_API_KEY is missing or invalid. Falling back to offline intelligent translator.")
            from app.ml.translation.indictrans2_provider import indictrans2_provider
            return asyncio.run(indictrans2_provider.translate(text, source_lang, target_lang))

        url = "https://integrate.api.nvidia.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        # Specialized system prompt for Hinglish vs Indic languages
        if source_lang in ["hinglish", "hi_latin"] or any(w in text.lower() for w in ["mein", "handpump", "kharab", "paani", "rakha"]):
            system_instruction = (
                "You are an expert machine translator specializing in Hinglish (Hindi text written in Latin/English alphabet). "
                "Translate ALL Hindi and Hinglish words into pure, fluent, natural English. "
                "CRITICAL: Do NOT output any Devanagari script (Hindi characters like 'गांव', 'पानी') or Romanized Hindi words ('kharab', 'paani'). "
                "Output ONLY the clean, fully translated English string with zero markdown or explanations."
            )
        else:
            system_instruction = (
                "You are an expert machine translator for Indian regional languages into English. "
                "Translate the text into clean, natural English. Output ONLY the clean translated English string, with no markdown code blocks or explanations."
            )

        prompt = f"{system_instruction}\n\nSource Language: {source_lang}\nInput Text:\n{text.strip()}"

        last_error = None
        for model in NVIDIA_TRANSLATE_MODELS:
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "max_tokens": 1500
            }
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")

            try:
                with urllib.request.urlopen(req, timeout=30) as resp:
                    body = json.loads(resp.read().decode("utf-8"))
                    choices = body.get("choices", [])
                    if choices:
                        translated = choices[0].get("message", {}).get("content", "").strip()
                        # Clean up surrounding quotes if present
                        if translated.startswith('"') and translated.endswith('"'):
                            translated = translated[1:-1].strip()

                        # Quality Validation Guardrail Check
                        is_valid, quality_reason, score = validate_translation_quality(text, translated, source_lang)
                        if is_valid:
                            log.info(f"NVIDIA Translation [{model}] ({source_lang}->{target_lang}) Success (quality_score={score}): '{text[:30]}' -> '{translated[:30]}'")
                            return translated
                        else:
                            log.warning(f"NVIDIA Translation [{model}] Quality Check Failed: {quality_reason}. Output: '{translated[:50]}'. Trying next model...")

            except Exception as e:
                last_error = e
                log.warning(f"NVIDIA model '{model}' failed: {e}. Trying next model...")
                continue

        log.warning(f"All NVIDIA translation models failed ({last_error}). Falling back to offline intelligent translator.")
        from app.ml.translation.indictrans2_provider import indictrans2_provider
        return asyncio.run(indictrans2_provider.translate(text, source_lang, target_lang))

    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str = "en"
    ) -> str:
        """Async wrapper executing HTTP request in thread executor."""
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(
            None,
            self._translate_sync,
            text,
            source_lang,
            target_lang
        )


# Global instance
nvidia_provider = NvidiaTranslationProvider()
