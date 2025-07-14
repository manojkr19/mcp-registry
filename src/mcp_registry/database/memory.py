import asyncio
import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from ..models import Server, ServerDetail
from .base import (
    Database,
    ConnectionType,
    ConnectionInfo,
    NotFoundError,
    AlreadyExistsError,
    InvalidInputError,
    InvalidVersionError,
)


def compare_semantic_versions(version1: str, version2: str) -> int:
    """
    Compare two semantic version strings
    Returns:
        -1 if version1 < version2
         0 if version1 == version2
        +1 if version1 > version2
    """
    def parse_version(version: str) -> List[int]:
        parts = version.split(".")
        # Convert to integers, default to 0 for non-numeric parts
        result = []
        for part in parts:
            try:
                result.append(int(part))
            except ValueError:
                result.append(0)
        return result

    parts1 = parse_version(version1)
    parts2 = parse_version(version2)
    
    # Pad with zeros to make equal length
    max_len = max(len(parts1), len(parts2))
    parts1.extend([0] * (max_len - len(parts1)))
    parts2.extend([0] * (max_len - len(parts2)))
    
    # Compare each part
    for i in range(max_len):
        if parts1[i] < parts2[i]:
            return -1
        elif parts1[i] > parts2[i]:
            return 1
    
    return 0


class MemoryDB(Database):
    """In-memory implementation of the Database interface"""

    def __init__(self, initial_data: Optional[Dict[str, Server]] = None):
        self.entries: Dict[str, ServerDetail] = {}
        self._lock = asyncio.Lock()
        
        # Convert Server entries to ServerDetail entries if provided
        if initial_data:
            for server_id, server in initial_data.items():
                self.entries[server_id] = ServerDetail(
                    id=server.id,
                    name=server.name,
                    description=server.description,
                    repository=server.repository,
                    version_detail=server.version_detail,
                )

    async def list(
        self,
        filter_params: Optional[Dict[str, Any]] = None,
        cursor: Optional[str] = None,
        limit: int = 10,
    ) -> Tuple[List[Server], Optional[str]]:
        """List servers with optional filtering and pagination"""
        async with self._lock:
            if limit <= 0:
                limit = 10

            # Convert all entries to Server objects
            all_servers = []
            for entry in self.entries.values():
                server = Server(
                    id=entry.id,
                    name=entry.name,
                    description=entry.description,
                    repository=entry.repository,
                    version_detail=entry.version_detail,
                )
                all_servers.append(server)

            # Apply filters
            filtered_servers = []
            for server in all_servers:
                include = True
                
                if filter_params:
                    for key, value in filter_params.items():
                        if key == "name" and server.name != value:
                            include = False
                            break
                        elif key == "repoUrl" and server.repository.url != value:
                            include = False
                            break
                        elif key == "serverDetail.id" and server.id != value:
                            include = False
                            break
                        elif key == "version" and server.version_detail.version != value:
                            include = False
                            break
                
                if include:
                    filtered_servers.append(server)

            # Sort by ID for consistent pagination
            filtered_servers.sort(key=lambda s: s.id)

            # Find starting point for cursor-based pagination
            start_idx = 0
            if cursor:
                for i, server in enumerate(filtered_servers):
                    if server.id == cursor:
                        start_idx = i + 1
                        break

            # Apply pagination
            end_idx = start_idx + limit
            if end_idx > len(filtered_servers):
                end_idx = len(filtered_servers)

            result = filtered_servers[start_idx:end_idx] if start_idx < len(filtered_servers) else []

            # Determine next cursor
            next_cursor = None
            if end_idx < len(filtered_servers):
                next_cursor = filtered_servers[end_idx - 1].id

            return result, next_cursor

    async def get_by_id(self, id: str) -> ServerDetail:
        """Get a server by its ID"""
        async with self._lock:
            if id in self.entries:
                # Return a copy
                entry = self.entries[id]
                return ServerDetail.model_validate(entry.model_dump())
            
            raise NotFoundError(f"Server with ID {id} not found")

    async def publish(self, server_detail: ServerDetail) -> None:
        """Publish a new server"""
        async with self._lock:
            # Validate input
            if not server_detail.name:
                raise InvalidInputError("Server name is required")
            
            if not server_detail.repository.url:
                raise InvalidInputError("Repository URL is required")

            # Check for existing versions
            latest_version = ""
            for entry in self.entries.values():
                if entry.name == server_detail.name:
                    if entry.version_detail.version == server_detail.version_detail.version:
                        raise AlreadyExistsError(
                            f"Server {server_detail.name} version {server_detail.version_detail.version} already exists"
                        )
                    
                    # Track the latest version
                    if not latest_version or compare_semantic_versions(entry.version_detail.version, latest_version) > 0:
                        latest_version = entry.version_detail.version

            # Check version ordering
            if latest_version and compare_semantic_versions(server_detail.version_detail.version, latest_version) < 0:
                raise InvalidVersionError(
                    f"Cannot publish older version {server_detail.version_detail.version} after newer version {latest_version}"
                )

            # Generate ID and set metadata
            server_detail.id = str(uuid.uuid4())
            server_detail.version_detail.is_latest = True
            server_detail.version_detail.release_date = datetime.now().isoformat()

            # Store a copy
            self.entries[server_detail.id] = ServerDetail.model_validate(server_detail.model_dump())

    async def import_seed(self, seed_file_path: str) -> None:
        """Import initial data from a seed file"""
        try:
            with open(seed_file_path, 'r') as f:
                seed_data = json.load(f)
        except FileNotFoundError:
            raise InvalidInputError(f"Seed file not found: {seed_file_path}")
        except json.JSONDecodeError as e:
            raise InvalidInputError(f"Invalid JSON in seed file: {e}")

        # Validate seed data format
        if not isinstance(seed_data, list):
            raise InvalidInputError("Seed data must be a list of servers")

        print(f"Importing {len(seed_data)} servers into memory database")

        async with self._lock:
            for i, server_data in enumerate(seed_data):
                try:
                    server = ServerDetail.model_validate(server_data)
                    
                    if not server.id or not server.name:
                        print(f"Skipping server {i + 1}: ID or Name is empty")
                        continue

                    # Set default version if missing
                    if not server.version_detail.version:
                        server.version_detail.version = "0.0.1-seed"
                        server.version_detail.release_date = datetime.now().isoformat()
                        server.version_detail.is_latest = True

                    # Store the server
                    self.entries[server.id] = server
                    print(f"[{i + 1}/{len(seed_data)}] Imported server: {server.name}")
                    
                except Exception as e:
                    print(f"Error importing server {i + 1}: {e}")
                    continue

        print("Memory database import completed successfully")

    async def close(self) -> None:
        """Close the database connection (no-op for memory DB)"""
        pass

    def connection_info(self) -> ConnectionInfo:
        """Get connection information"""
        return ConnectionInfo(
            type=ConnectionType.MEMORY,
            is_connected=True,
            raw=self.entries,
        )