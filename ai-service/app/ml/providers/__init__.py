import logging
from app.ml.providers.base import AIProvider
from app.ml.providers.nvidia_vision_provider import nvidia_vision_provider, NvidiaVisionProvider
from app.ml.providers.gemini_provider import gemini_multimodal_provider, GeminiMultimodalProvider
from app.ml.providers.mock_provider import mock_ai_provider, MockAIProvider
from app.core.config import settings

log = logging.getLogger(__name__)


def get_ai_provider() -> AIProvider:
    provider_type = getattr(settings, "TRANSLATION_PROVIDER", "nvidia").lower()
    if provider_type == "nvidia" or getattr(settings, "NVIDIA_API_KEY", "").startswith("nvapi-"):
        log.info("Using NVIDIA Multimodal Vision AI Provider (meta/llama-3.2-11b-vision-instruct).")
        return nvidia_vision_provider
    elif provider_type == "mock":
        log.info("Using Mock AI Provider.")
        return mock_ai_provider
    log.info("Using Gemini Multimodal Provider.")
    return gemini_multimodal_provider
