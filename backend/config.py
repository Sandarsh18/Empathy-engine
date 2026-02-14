"""
Configuration management using environment variables and pydantic settings.
Supports multiple LLM providers with fallback to mock for local development.
"""
import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # LLM Provider Configuration
    provider: str = "mock"  # Options: "mock", "gemini", "perplexity"
    gemini_model: str = "gemini-2.0-flash-002"  # Default Gemini model; override with GEMINI_MODEL
    
    # API Keys (set these in production)
    gemini_api_key: Optional[str] = None
    perplexity_api_key: Optional[str] = None
    
    # Application Settings
    app_name: str = "MH Companion Minimal"
    debug: bool = False
    log_level: str = "INFO"
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

# Global settings instance
settings = Settings()

def get_provider_status() -> dict:
    """
    Check which providers are properly configured.
    
    Returns:
        Dictionary showing configuration status of each provider
    """
    status = {
        "mock": {"available": True, "configured": True},
        "gemini": {
            "available": bool(settings.gemini_api_key),
            "configured": bool(settings.gemini_api_key and len(settings.gemini_api_key) > 10)
        },
        "perplexity": {
            "available": bool(settings.perplexity_api_key),
            "configured": bool(settings.perplexity_api_key and len(settings.perplexity_api_key) > 10)
        }
    }
    return status

def validate_provider_config() -> bool:
    """
    Validate that the selected provider is properly configured.
    
    Returns:
        True if provider is configured, False otherwise
    """
    provider_status = get_provider_status()
    current_provider = settings.provider.lower()
    
    if current_provider not in provider_status:
        return False
        
    return provider_status[current_provider]["configured"]
