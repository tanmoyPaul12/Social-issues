"""
Abstract Base Interface for Machine Translation Providers.
"""
from abc import ABC, abstractmethod


class TranslationProvider(ABC):
    """Abstract base interface for Machine Translation models."""

    @abstractmethod
    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str = "en"
    ) -> str:
        """
        Translates text from source_lang to target_lang.

        :param text: Input text to translate.
        :param source_lang: Source language code (e.g. 'hi', 'bn', 'sat').
        :param target_lang: Target language code (default 'en').
        :return: Translated text in target language.
        """
        pass
