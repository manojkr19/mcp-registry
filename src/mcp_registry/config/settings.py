from enum import Enum
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class DatabaseType(str, Enum):
    """Database type options"""
    MONGODB = "mongodb"
    MEMORY = "memory"


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Server configuration
    server_address: str = Field(default=":8080")
    
    # Database configuration
    database_type: DatabaseType = Field(default=DatabaseType.MONGODB)
    database_url: str = Field(default="mongodb://localhost:27017")
    database_name: str = Field(default="mcp-registry")
    collection_name: str = Field(default="servers_v2")
    
    # Logging configuration
    log_level: str = Field(default="info")
    
    # Seed data configuration
    seed_file_path: str = Field(default="data/seed.json")
    seed_import: bool = Field(default=True)
    
    # Application metadata
    version: str = Field(default="dev")
    
    # Authentication configuration (extensible for future auth methods)
    auth_enabled: bool = Field(default=False)
    auth_method: Optional[str] = Field(default=None)

    model_config = {
        "env_prefix": "MCP_REGISTRY_",
        "case_sensitive": False,
        "env_file": ".env"
    }


def get_settings() -> Settings:
    """Get application settings (cached)"""
    return Settings()