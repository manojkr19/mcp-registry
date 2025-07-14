import asyncio
from abc import ABC, abstractmethod
from typing import List, Optional, Tuple

from ..database import Database
from ..database.base import InvalidInputError
from ..models import Server, ServerDetail


class RegistryService(ABC):
    """Abstract interface for registry operations"""

    @abstractmethod
    async def list(
        self, 
        cursor: Optional[str] = None, 
        limit: int = 30
    ) -> Tuple[List[Server], Optional[str]]:
        """
        List servers with pagination
        
        Args:
            cursor: Pagination cursor
            limit: Maximum number of results
            
        Returns:
            Tuple of (servers, next_cursor)
        """
        pass

    @abstractmethod
    async def get_by_id(self, id: str) -> ServerDetail:
        """
        Get server details by ID
        
        Args:
            id: Server ID
            
        Returns:
            ServerDetail object
        """
        pass

    @abstractmethod
    async def publish(self, server_detail: ServerDetail) -> None:
        """
        Publish a new server
        
        Args:
            server_detail: Server details to publish
        """
        pass


class RegistryServiceImpl(RegistryService):
    """Implementation of RegistryService using a Database"""

    def __init__(self, database: Database):
        self.db = database

    async def list(
        self, 
        cursor: Optional[str] = None, 
        limit: int = 30
    ) -> Tuple[List[Server], Optional[str]]:
        """List servers with pagination"""
        
        # Set default limit if not provided or invalid
        if limit <= 0:
            limit = 30
        
        # Add timeout to database operation
        try:
            servers, next_cursor = await asyncio.wait_for(
                self.db.list(cursor=cursor, limit=limit),
                timeout=5.0
            )
            return servers, next_cursor
        except asyncio.TimeoutError:
            raise Exception("Database operation timed out")

    async def get_by_id(self, id: str) -> ServerDetail:
        """Get server details by ID"""
        
        # Add timeout to database operation
        try:
            server_detail = await asyncio.wait_for(
                self.db.get_by_id(id),
                timeout=5.0
            )
            return server_detail
        except asyncio.TimeoutError:
            raise Exception("Database operation timed out")

    async def publish(self, server_detail: ServerDetail) -> None:
        """Publish a new server"""
        
        if server_detail is None:
            raise InvalidInputError("Server detail cannot be None")
        
        # Add timeout to database operation
        try:
            await asyncio.wait_for(
                self.db.publish(server_detail),
                timeout=5.0
            )
        except asyncio.TimeoutError:
            raise Exception("Database operation timed out")