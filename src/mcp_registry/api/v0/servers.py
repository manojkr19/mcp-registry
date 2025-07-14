import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from ...database import Database
from ...database.base import NotFoundError
from ...models import Server, ServerDetail
from ...service import RegistryService


class Metadata(BaseModel):
    """Pagination metadata"""
    next_cursor: Optional[str] = None
    count: Optional[int] = None
    total: Optional[int] = None


class PaginatedResponse(BaseModel):
    """Paginated API response"""
    servers: List[Server]
    metadata: Optional[Metadata] = None


servers_router = APIRouter(prefix="/v0", tags=["servers"])


def get_registry_service() -> RegistryService:
    """Dependency to get registry service"""
    from ...main import app_state
    return app_state["registry_service"]


@servers_router.get("/servers", response_model=PaginatedResponse)
async def list_servers(
    cursor: Optional[str] = Query(None, description="Pagination cursor"),
    limit: int = Query(30, ge=1, le=100, description="Number of servers to return"),
    registry: RegistryService = Depends(get_registry_service),
):
    """List servers with pagination"""
    
    # Validate cursor format if provided
    if cursor:
        try:
            uuid.UUID(cursor)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid cursor parameter")
    
    try:
        servers, next_cursor = await registry.list(cursor=cursor, limit=limit)
        
        # Create response
        response = PaginatedResponse(servers=servers)
        
        # Add metadata if there's a next cursor
        if next_cursor:
            response.metadata = Metadata(
                next_cursor=next_cursor,
                count=len(servers),
            )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@servers_router.get("/servers/{server_id}", response_model=ServerDetail)
async def get_server_detail(
    server_id: str,
    registry: RegistryService = Depends(get_registry_service),
):
    """Get detailed information about a specific server"""
    
    # Validate server ID format
    try:
        uuid.UUID(server_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid server ID format")
    
    try:
        server_detail = await registry.get_by_id(server_id)
        return server_detail
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Server not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error retrieving server details")