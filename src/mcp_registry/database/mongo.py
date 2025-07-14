import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from pymongo import errors as pymongo_errors

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


class MongoDB(Database):
    """MongoDB implementation of the Database interface"""

    def __init__(self, connection_uri: str, database_name: str, collection_name: str):
        self.connection_uri = connection_uri
        self.database_name = database_name
        self.collection_name = collection_name
        self.client: Optional[AsyncIOMotorClient] = None
        self.database: Optional[AsyncIOMotorDatabase] = None
        self.collection: Optional[AsyncIOMotorCollection] = None

    async def connect(self) -> None:
        """Connect to MongoDB and setup indexes"""
        self.client = AsyncIOMotorClient(self.connection_uri)
        
        # Ping to verify connection
        await self.client.admin.command('ping')
        
        self.database = self.client[self.database_name]
        self.collection = self.database[self.collection_name]

        # Create indexes for better query performance
        try:
            await self.collection.create_index("name")
            await self.collection.create_index("id", unique=True)
            await self.collection.create_index([("name", 1), ("version_detail.version", 1)], unique=True)
        except pymongo_errors.OperationFailure as e:
            if e.code != 86:  # Index already exists
                raise
            print("Indexes already exist, skipping.")

    async def list(
        self,
        filter_params: Optional[Dict[str, Any]] = None,
        cursor: Optional[str] = None,
        limit: int = 10,
    ) -> Tuple[List[Server], Optional[str]]:
        """List servers with optional filtering and pagination"""
        if not self.collection:
            raise InvalidInputError("Database not connected")

        if limit <= 0:
            limit = 10

        # Build MongoDB filter
        mongo_filter = {"version_detail.is_latest": True}
        
        if filter_params:
            for key, value in filter_params.items():
                if key == "version":
                    mongo_filter["version_detail.version"] = value
                elif key == "name":
                    mongo_filter["name"] = value
                else:
                    mongo_filter[key] = value

        # Handle cursor-based pagination
        if cursor:
            try:
                uuid.UUID(cursor)  # Validate cursor format
            except ValueError:
                raise InvalidInputError("Invalid cursor format")
            
            # Check if cursor document exists
            cursor_doc = await self.collection.find_one({"id": cursor})
            if cursor_doc:
                mongo_filter["id"] = {"$gt": cursor}

        # Execute query with sorting and limit
        cursor_obj = self.collection.find(mongo_filter).sort("id", 1).limit(limit)
        documents = await cursor_obj.to_list(length=limit)

        # Convert to Server objects
        servers = []
        for doc in documents:
            try:
                server = Server.model_validate(doc)
                servers.append(server)
            except Exception as e:
                print(f"Error parsing server document: {e}")
                continue

        # Determine next cursor
        next_cursor = None
        if len(servers) >= limit and servers:
            next_cursor = servers[-1].id

        return servers, next_cursor

    async def get_by_id(self, id: str) -> ServerDetail:
        """Get a server by its ID"""
        if not self.collection:
            raise InvalidInputError("Database not connected")

        document = await self.collection.find_one({"id": id})
        if not document:
            raise NotFoundError(f"Server with ID {id} not found")

        try:
            return ServerDetail.model_validate(document)
        except Exception as e:
            raise InvalidInputError(f"Error parsing server document: {e}")

    async def publish(self, server_detail: ServerDetail) -> None:
        """Publish a new server"""
        if not self.collection:
            raise InvalidInputError("Database not connected")

        # Check for existing server with same name
        existing_filter = {
            "name": server_detail.name,
            "version_detail.is_latest": True,
        }
        
        existing_doc = await self.collection.find_one(existing_filter)
        
        if existing_doc:
            existing_server = ServerDetail.model_validate(existing_doc)
            if server_detail.version_detail.version <= existing_server.version_detail.version:
                raise InvalidVersionError(
                    f"Version must be greater than existing version {existing_server.version_detail.version}"
                )

        # Set metadata
        server_detail.id = str(uuid.uuid4())
        server_detail.version_detail.is_latest = True
        server_detail.version_detail.release_date = datetime.now().isoformat()

        # Insert new document
        try:
            await self.collection.insert_one(server_detail.model_dump())
        except pymongo_errors.DuplicateKeyError:
            raise AlreadyExistsError(f"Server {server_detail.name} version {server_detail.version_detail.version} already exists")

        # Update existing entry to not be latest
        if existing_doc:
            await self.collection.update_one(
                {"id": existing_doc["id"]},
                {"$set": {"version_detail.is_latest": False}}
            )

    async def import_seed(self, seed_file_path: str) -> None:
        """Import initial data from a seed file"""
        if not self.collection:
            raise InvalidInputError("Database not connected")

        try:
            with open(seed_file_path, 'r') as f:
                seed_data = json.load(f)
        except FileNotFoundError:
            raise InvalidInputError(f"Seed file not found: {seed_file_path}")
        except json.JSONDecodeError as e:
            raise InvalidInputError(f"Invalid JSON in seed file: {e}")

        if not isinstance(seed_data, list):
            raise InvalidInputError("Seed data must be a list of servers")

        print(f"Importing {len(seed_data)} servers into collection {self.collection.name}")

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

                # Upsert the document
                filter_doc = {"id": server.id}
                update_doc = {"$set": server.model_dump()}
                
                result = await self.collection.update_one(
                    filter_doc, update_doc, upsert=True
                )
                
                if result.upserted_id:
                    print(f"[{i + 1}/{len(seed_data)}] Created server: {server.name}")
                elif result.modified_count > 0:
                    print(f"[{i + 1}/{len(seed_data)}] Updated server: {server.name}")
                else:
                    print(f"[{i + 1}/{len(seed_data)}] Server already up to date: {server.name}")
                    
            except Exception as e:
                print(f"Error importing server {i + 1}: {e}")
                continue

        print("MongoDB database import completed successfully")

    async def close(self) -> None:
        """Close the database connection"""
        if self.client:
            self.client.close()

    def connection_info(self) -> ConnectionInfo:
        """Get connection information"""
        is_connected = False
        if self.client:
            try:
                # Quick ping to check connection
                # Note: In real async usage, this should be awaited
                is_connected = True
            except Exception:
                is_connected = False

        return ConnectionInfo(
            type=ConnectionType.MONGODB,
            is_connected=is_connected,
            raw=self.client,
        )