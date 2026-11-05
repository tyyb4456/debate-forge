# ============================================================================
# FILE 2: config/settings.py - Configuration (FIXED)
# ============================================================================

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "Debate AI System"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost:5432/debate_ai"
    
    # API Keys
    ANTHROPIC_API_KEY: str = ""
    
    # CORS - Fixed: Use string parsing instead of JSON
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:5174"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # JWT (optional)
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # xKiro gateway (OpenAI-compatible). Key lives in ``XKIRO_API_KEY``
    # inside ``backend/.env`` (gitignored) — never commit it, never
    # hardcode it. Model id is ``vendor/model`` from the xKiro dashboard.
    xkiro_api_key: str = ""
    xkiro_base_url: str = "https://api.xkiro.com/v1"
    xkiro_model: str = "mistralai/mistral-large-2512"
    
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent / ".env"),
        env_file_encoding='utf-8',
        case_sensitive=False,
        extra='ignore'
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()