"""Compatibility wrapper for the application's IndicTrans2 provider."""

from app.preprocessing.text.translator import indictrans2_provider


class TranslationModel:
    """Expose the same real local model used by text preprocessing."""

    async def translate(self, text: str, src: str, tgt: str) -> str:
        return await indictrans2_provider.translate(text, src, tgt)

translation_engine = TranslationModel()
