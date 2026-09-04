"""
Application Settings & Environment Configuration.
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Configuration settings for AI Microservice.
    Loaded from environment variables or default values.
    """
    APP_NAME: str = "Societal Innovation AI Microservice"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Translation Configuration
    TRANSLATION_PROVIDER: str = os.getenv("TRANSLATION_PROVIDER", "nvidia")
    
    # NVIDIA NIM Translation API Configuration
    NVIDIA_API_KEY: str = os.getenv(
        "NVIDIA_API_KEY",
        "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"
    )
    NVIDIA_TRANSLATE_MODEL: str = os.getenv(
        "NVIDIA_TRANSLATE_MODEL",
        "google/diffusiongemma-26b-a4b-it"
    )

    # Gemini API Configuration
    GEMINI_API_KEY: str = os.getenv(
        "GEMINI_API_KEY",
        ""
    )

    # IndicTrans2 Model Configuration (Fallback)
    INDICTRANS_MODEL_PATH: str = os.getenv(
        "INDICTRANS_MODEL_PATH",
        "./models/indictrans2/indic-en"
    )
    TRANSLATION_DEVICE: str = os.getenv(
        "TRANSLATION_DEVICE",
        "cpu"
    )

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
