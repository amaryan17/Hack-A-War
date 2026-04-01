"""
Aegis Migration Factory — Configuration
Pydantic BaseSettings, loads from .env file
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = "sk-placeholder"
    REDIS_URL: str = "redis://localhost:6379"
    ARTIFACTS_DIR: str = "./artifacts"
    KEYS_DIR: str = "./keys"
    MAX_UPLOAD_SIZE_MB: int = 50
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20241022"
    DEMO_MODE: bool = False
    CORS_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
