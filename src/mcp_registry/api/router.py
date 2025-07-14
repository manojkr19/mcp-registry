from fastapi import APIRouter

from .v0 import health_router, servers_router, publish_router

# Main API router
router = APIRouter()

# Include all v0 routers
router.include_router(health_router)
router.include_router(servers_router)
router.include_router(publish_router)