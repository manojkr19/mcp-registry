from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel

from ...auth import AuthService
from ...database.base import AlreadyExistsError, InvalidVersionError, InvalidInputError
from ...models import PublishRequest, ServerDetail, AuthMethod, Authentication
from ...service import RegistryService


class PublishResponse(BaseModel):
    """Response for successful publish"""
    message: str
    id: str


publish_router = APIRouter(prefix="/v0", tags=["publish"])


def get_registry_service() -> RegistryService:
    """Dependency to get registry service"""
    from ...main import app_state
    return app_state["registry_service"]


def get_auth_service() -> AuthService:
    """Dependency to get auth service"""
    from ...main import app_state
    return app_state["auth_service"]


@publish_router.post("/publish", response_model=PublishResponse, status_code=201)
async def publish_server(
    publish_request: PublishRequest,
    authorization: Optional[str] = Header(None),
    registry: RegistryService = Depends(get_registry_service),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Publish a new server to the registry"""
    
    # Validate required fields
    if not publish_request.name:
        raise HTTPException(status_code=400, detail="Name is required")
    
    if not publish_request.version_detail.version:
        raise HTTPException(status_code=400, detail="Version is required")
    
    # Handle authentication
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is required")
    
    # Extract token from Bearer format
    token = authorization
    if authorization.upper().startswith("BEARER "):
        token = authorization[7:]
    
    # Determine authentication method based on server name prefix
    auth_method = AuthMethod.NONE
    if publish_request.name.startswith("io.github"):
        auth_method = AuthMethod.GITHUB
    
    # Setup authentication info
    auth_info = Authentication(
        method=auth_method,
        token=token,
        repo_ref=publish_request.name,
    )
    
    # Validate authentication
    try:
        is_valid = await auth_service.validate_auth(auth_info)
        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
    
    # Convert PublishRequest to ServerDetail
    server_detail = ServerDetail(
        id=publish_request.id,
        name=publish_request.name,
        description=publish_request.description,
        repository=publish_request.repository,
        version_detail=publish_request.version_detail,
        packages=publish_request.packages,
        remotes=publish_request.remotes,
    )
    
    # Publish the server
    try:
        await registry.publish(server_detail)
        
        return PublishResponse(
            message="Server publication successful",
            id=server_detail.id,
        )
        
    except (InvalidVersionError, AlreadyExistsError, InvalidInputError) as e:
        raise HTTPException(status_code=400, detail=f"Failed to publish server details: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to publish server details: {str(e)}")