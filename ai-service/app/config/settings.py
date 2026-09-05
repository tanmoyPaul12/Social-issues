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

    # IndicTrans2 Model Configuration
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
