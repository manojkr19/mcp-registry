from fastapi import APIRouter
from pydantic import BaseModel

from ...config import get_settings


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    auth_enabled: bool


health_router = APIRouter(prefix="/v0", tags=["health"])


@health_router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    settings = get_settings()
    return HealthResponse(
        status="ok",
        auth_enabled=settings.auth_enabled,
    )