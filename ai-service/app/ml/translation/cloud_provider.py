"""
Google Gemini Cloud Translation Provider.
High-accuracy cloud machine translation for Indian languages (Hindi, Bengali, Santali Ol Chiki, Hinglish, etc.)
with automated fallback across Gemini flash models.
"""
import asyncio
import json
import logging
import urllib.request
from typing import Optional, List

from app.ml.translation.base import TranslationProvider
from app.core.config import settings

log = logging.getLogger(__name__)

GEMINI_SYSTEM_INSTRUCTION = (
    "You are an expert, precise machine translator for Indian regional languages into English. "
    "Output ONLY the clean, natural English translation string. "
    "Do NOT include conversational filler, markdown formatting, preamble, or extra explanations."
)

FALLBACK_MODELS: List[str] = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-pro"
]


class GeminiTranslationProvider(TranslationProvider):
    """
    Google Gemini Cloud Translation Provider with model fallback chain.
    Calls Gemini REST API using lightweight urllib.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or getattr(settings, "GEMINI_API_KEY", "")

    def _translate_sync(self, text: str, source_lang: str, target_lang: str) -> str:
        if not text or not text.strip():
            return ""

        if not self.api_key or not self.api_key.startswith("AIza"):
            log.warning("GEMINI_API_KEY is missing or invalid key format. Using intelligent offline translator fallback.")
            from app.ml.translation.indictrans2_provider import indictrans2_provider
            return asyncio.run(indictrans2_provider.translate(text, source_lang, target_lang))

        headers = {"Content-Type": "application/json"}
        prompt = f"{GEMINI_SYSTEM_INSTRUCTION}\n\nSource Language: {source_lang}\nText to Translate: {text.strip()}"
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        data = json.dumps(payload).encode("utf-8")

        last_error = None
        for model in FALLBACK_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")

            try:
                with urllib.request.urlopen(req, timeout=10) as resp:
                    body = json.loads(resp.read().decode("utf-8"))
                    candidates = body.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            translated = parts[0].get("text", "").strip()
                            return translated
            except Exception as e:
                last_error = e
                log.warning(f"Gemini API model '{model}' failed ({e}). Trying next fallback model...")
                continue

        log.warning(f"All Gemini Translation models failed ({last_error}). Using intelligent offline translator fallback.")
        from app.ml.translation.indictrans2_provider import indictrans2_provider
        return asyncio.run(indictrans2_provider.translate(text, source_lang, target_lang))

    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str = "en"
    ) -> str:
        """
        Translates text asynchronously using threadpool offloading.
        """
        if not text or not text.strip():
            return ""

        if source_lang == "en" or target_lang == source_lang:
            return text

        return await asyncio.to_thread(
            self._translate_sync,
            text,
            source_lang,
            target_lang
        )


# Global Gemini Provider Instance
gemini_provider = GeminiTranslationProvider()
