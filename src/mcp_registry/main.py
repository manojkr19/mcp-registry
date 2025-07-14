import asyncio
import logging
import signal
import sys
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from .api import router
from .auth import AuthService
from .auth.base import NoOpAuthService, SimpleTokenAuthService
from .config import Settings, DatabaseType, get_settings
from .database import Database, MemoryDB, MongoDB
from .service import RegistryService, RegistryServiceImpl


# Global application state
app_state = {}


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler"""
    settings = get_settings()
    
    # Initialize database
    database = None
    try:
        if settings.database_type == DatabaseType.MEMORY:
            database = MemoryDB()
            print(f"Using in-memory database")
        elif settings.database_type == DatabaseType.MONGODB:
            database = MongoDB(
                connection_uri=settings.database_url,
                database_name=settings.database_name,
                collection_name=settings.collection_name,
            )
            await database.connect()
            print(f"Connected to MongoDB: {settings.database_name}/{settings.collection_name}")
        else:
            raise ValueError(f"Unsupported database type: {settings.database_type}")
        
        # Import seed data if requested
        if settings.seed_import and settings.seed_file_path:
            print("Importing seed data...")
            try:
                await database.import_seed(settings.seed_file_path)
                print("Seed data import completed successfully")
            except Exception as e:
                print(f"Failed to import seed data: {e}")
        
        # Initialize services
        registry_service = RegistryServiceImpl(database)
        
        # Initialize auth service
        auth_service: AuthService
        if settings.auth_enabled:
            if settings.auth_method == "simple_token":
                # In production, tokens would come from environment or secure storage
                auth_service = SimpleTokenAuthService(["your-secret-token"])
            else:
                auth_service = NoOpAuthService()
        else:
            auth_service = NoOpAuthService()
        
        # Store in global state
        app_state["database"] = database
        app_state["registry_service"] = registry_service
        app_state["auth_service"] = auth_service
        app_state["settings"] = settings
        
        print(f"MCP Registry started successfully")
        print(f"- Database: {settings.database_type}")
        print(f"- Auth enabled: {settings.auth_enabled}")
        print(f"- Version: {settings.version}")
        
        yield
        
    finally:
        # Cleanup
        if database:
            try:
                await database.close()
                print("Database connection closed successfully")
            except Exception as e:
                print(f"Error closing database connection: {e}")


# Dependency injection functions
async def get_registry_service() -> RegistryService:
    """Get the registry service instance"""
    return app_state["registry_service"]


async def get_auth_service() -> AuthService:
    """Get the auth service instance"""
    return app_state["auth_service"]


# Dependencies are handled via direct import in each module


def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    settings = get_settings()
    
    app = FastAPI(
        title="MCP Registry",
        description="Model Context Protocol Registry - Python Implementation",
        version=settings.version,
        lifespan=lifespan,
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000", 
            "http://127.0.0.1:3000",
            "http://localhost:3001", 
            "http://127.0.0.1:3001"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include API routes
    app.include_router(router)
    
    return app


# Create the FastAPI app
app = create_app()


def setup_logging():
    """Setup application logging"""
    settings = get_settings()
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
    
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    print(f"\nReceived signal {signum}, shutting down server...")
    sys.exit(0)


def main():
    """Main entry point for running the server"""
    setup_logging()
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    settings = get_settings()
    
    # Parse server address
    host = "0.0.0.0"
    port = 8080
    
    if settings.server_address.startswith(":"):
        port = int(settings.server_address[1:])
    elif ":" in settings.server_address:
        host, port_str = settings.server_address.rsplit(":", 1)
        port = int(port_str)
    
    print(f"Starting MCP Registry v{settings.version}")
    print(f"Server will be available at http://{host}:{port}")
    
    # Run the server
    uvicorn.run(
        "mcp_registry.main:app",
        host=host,
        port=port,
        reload=False,
        log_level=settings.log_level.lower(),
    )


if __name__ == "__main__":
    main()