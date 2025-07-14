from abc import ABC, abstractmethod
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel

from ..models import Server, ServerDetail


class DatabaseError(Exception):
    """Base class for database errors"""
    pass


class NotFoundError(DatabaseError):
    """Record not found error"""
    pass


class AlreadyExistsError(DatabaseError):
    """Record already exists error"""
    pass


class InvalidInputError(DatabaseError):
    """Invalid input error"""
    pass


class InvalidVersionError(DatabaseError):
    """Invalid version error"""
    pass


class ConnectionType(str, Enum):
    """Database connection types"""
    MEMORY = "memory"
    MONGODB = "mongodb"


class ConnectionInfo(BaseModel):
    """Database connection information"""
    type: ConnectionType
    is_connected: bool
    raw: Optional[Any] = None


class Database(ABC):
    """Abstract base class for database operations"""

    @abstractmethod
    async def list(
        self,
        filter_params: Optional[Dict[str, Any]] = None,
        cursor: Optional[str] = None,
        limit: int = 10,
    ) -> Tuple[List[Server], Optional[str]]:
        """
        List servers with optional filtering and pagination
        
        Args:
            filter_params: Optional filtering parameters
            cursor: Optional cursor for pagination
            limit: Maximum number of results to return
            
        Returns:
            Tuple of (servers, next_cursor)
        """
        pass

    @abstractmethod
    async def get_by_id(self, id: str) -> ServerDetail:
        """
        Get a server by its ID
        
        Args:
            id: Server ID
            
        Returns:
            ServerDetail object
            
        Raises:
            NotFoundError: If server not found
        """
        pass

    @abstractmethod
    async def publish(self, server_detail: ServerDetail) -> None:
        """
        Publish a new server
        
        Args:
            server_detail: Server details to publish
            
        Raises:
            AlreadyExistsError: If server already exists
            InvalidVersionError: If version is invalid
            InvalidInputError: If input is invalid
        """
        pass

    @abstractmethod
    async def import_seed(self, seed_file_path: str) -> None:
        """
        Import initial data from a seed file
        
        Args:
            seed_file_path: Path to the seed file
        """
        pass

    @abstractmethod
    async def close(self) -> None:
        """Close the database connection"""
        pass

    @abstractmethod
    def connection_info(self) -> ConnectionInfo:
        """Get connection information"""
        pass