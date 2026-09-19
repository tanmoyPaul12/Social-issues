"""
Application Settings & Environment Configuration.
Security Hardened: Zero hardcoded credentials or API keys.
All sensitive parameters loaded strictly from environment variables.
"""
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Configuration settings for AI Microservice.
    Loaded strictly from environment variables or safe defaults.
    """
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Societal Innovation AI Microservice"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Translation Configuration
    TRANSLATION_PROVIDER: str = os.getenv("TRANSLATION_PROVIDER", "nvidia")
    
    # NVIDIA NIM Translation API Configuration (Defaults to empty string - strictly no hardcoded keys)
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_TRANSLATE_MODEL: str = os.getenv(
        "NVIDIA_TRANSLATE_MODEL",
        "google/diffusiongemma-26b-a4b-it"
    )

    # Gemini API Configuration (Defaults to empty string)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # IndicTrans2 Model Configuration (Fallback)
    INDICTRANS_MODEL_PATH: str = os.getenv(
        "INDICTRANS_MODEL_PATH",
        "./models/indictrans2/indic-en"
    )
    TRANSLATION_DEVICE: str = os.getenv(
        "TRANSLATION_DEVICE",
        "cpu"
    )

    # =========================================================================
    # Supabase / PostgreSQL Database Configuration (Step 1 Foundation)
    # Credentials are provided strictly through environment variables.
    # =========================================================================
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.getenv("DB_NAME", "postgres")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_SSLMODE: str = os.getenv("DB_SSLMODE", "require")
    DB_POOL_MIN: int = int(os.getenv("DB_POOL_MIN", "1"))
    DB_POOL_MAX: int = int(os.getenv("DB_POOL_MAX", "10"))

    def get_database_url(self) -> str:
        """
        Returns normalized PostgreSQL connection URI.
        Prefers DATABASE_URL if set; otherwise constructs from components.
        """
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if "supabase.co" in url and "sslmode" not in url:
                separator = "&" if "?" in url else "?"
                url = f"{url}{separator}sslmode=require"
            return url
        
        user_pass = f"{self.DB_USER}:{self.DB_PASSWORD}@" if self.DB_USER else ""
        return f"postgresql://{user_pass}{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?sslmode={self.DB_SSLMODE}"

    def get_masked_database_url(self) -> str:
        """
        Returns database URI with credentials securely masked.
        Safe for logging and health checks.
        """
        url = self.get_database_url()
        if not url:
            return "NOT_CONFIGURED"
        if "@" in url and "://" in url:
            scheme, rest = url.split("://", 1)
            userinfo, hostinfo = rest.split("@", 1)
            if ":" in userinfo:
                user, _ = userinfo.split(":", 1)
                return f"{scheme}://{user}:***@{hostinfo}"
            return f"{scheme}://***@{hostinfo}"
        return url


settings = Settings()
