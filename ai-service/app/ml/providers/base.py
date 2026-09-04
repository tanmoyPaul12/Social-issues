"""
AI Provider Interface Contract.
Provides a clean, decoupled abstraction for Multimodal AI perception and reasoning,
allowing seamless swapping between Google Gemini Cloud, NVIDIA NIM, and local ML models.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class AIProvider(ABC):
    """
    Abstract contract for production AI operations across Text, Vision, Document,
    Categorization, and Priority Scoring.
    """

    @abstractmethod
    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str = "en"
    ) -> str:
        """Translates regional text into standardized English."""
        pass

    @abstractmethod
    async def analyze_image(
        self,
        image_bytes: bytes,
        mime_type: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyzes evidence photos for relevance, visual damage, and severity indicators."""
        pass

    @abstractmethod
    async def analyze_document(
        self,
        extracted_text: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyzes supporting documents/PDFs for complaint facts and population impact."""
        pass

    @abstractmethod
    async def categorize(
        self,
        unified_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Categorizes issue evidence into Jharkhand's 11 core thematic domains."""
        pass

    @abstractmethod
    async def prioritize(
        self,
        unified_context: Dict[str, Any],
        category_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluates issue urgency factors and returns structured priority indicators."""
        pass
