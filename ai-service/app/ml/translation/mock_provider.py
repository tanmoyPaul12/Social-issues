"""
Mock Translation Provider for testing without loading model weights.
"""
from app.ml.translation.base import TranslationProvider


class MockTranslator(TranslationProvider):
    """Passthrough / Mock translator for tests."""

    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str = "en"
    ) -> str:
        if source_lang == "en":
            return text
        return f"[Translated ({source_lang}->{target_lang})]: {text}"
