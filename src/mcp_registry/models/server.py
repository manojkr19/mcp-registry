from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class AuthMethod(str, Enum):
    """Authentication method used"""
    GITHUB = "github"
    NONE = "none"


class Authentication(BaseModel):
    """Authentication information"""
    method: Optional[AuthMethod] = None
    token: Optional[str] = None
    repo_ref: Optional[str] = None


class Repository(BaseModel):
    """Source code repository as defined in the spec"""
    url: str
    source: str
    id: str


class Format(str, Enum):
    """Input format types"""
    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    FILE_PATH = "file_path"


class Input(BaseModel):
    """User input as defined in the spec"""
    description: Optional[str] = None
    is_required: Optional[bool] = None
    format: Optional[Format] = None
    value: Optional[str] = None
    is_secret: Optional[bool] = None
    default: Optional[str] = None
    choices: Optional[List[str]] = None
    template: Optional[str] = None
    properties: Optional[Dict[str, "Input"]] = None


class InputWithVariables(BaseModel):
    """Input with variables support"""
    description: Optional[str] = None
    is_required: Optional[bool] = None
    format: Optional[Format] = None
    value: Optional[str] = None
    is_secret: Optional[bool] = None
    default: Optional[str] = None
    choices: Optional[List[str]] = None
    template: Optional[str] = None
    properties: Optional[Dict[str, Input]] = None
    variables: Optional[Dict[str, Input]] = None


class KeyValueInput(BaseModel):
    """Key-value input with variables"""
    name: str
    description: Optional[str] = None
    is_required: Optional[bool] = None
    format: Optional[Format] = None
    value: Optional[str] = None
    is_secret: Optional[bool] = None
    default: Optional[str] = None
    choices: Optional[List[str]] = None
    template: Optional[str] = None
    properties: Optional[Dict[str, Input]] = None
    variables: Optional[Dict[str, Input]] = None


class ArgumentType(str, Enum):
    """Argument types"""
    POSITIONAL = "positional"
    NAMED = "named"


class Argument(BaseModel):
    """Runtime argument definition"""
    type: ArgumentType
    name: Optional[str] = None
    is_repeated: Optional[bool] = None
    value_hint: Optional[str] = None
    description: Optional[str] = None
    is_required: Optional[bool] = None
    format: Optional[Format] = None
    value: Optional[str] = None
    is_secret: Optional[bool] = None
    default: Optional[str] = None
    choices: Optional[List[str]] = None
    template: Optional[str] = None
    properties: Optional[Dict[str, Input]] = None
    variables: Optional[Dict[str, Input]] = None


class Package(BaseModel):
    """Package definition"""
    registry_name: str
    name: str
    version: str
    runtime_hint: Optional[str] = None
    runtime_arguments: Optional[List[Argument]] = None
    package_arguments: Optional[List[Argument]] = None
    environment_variables: Optional[List[KeyValueInput]] = None


class Remote(BaseModel):
    """Remote connection endpoint"""
    transport_type: str
    url: str
    headers: Optional[List[Input]] = None


class VersionDetail(BaseModel):
    """Version details of a server"""
    version: str
    release_date: str
    is_latest: bool


class Server(BaseModel):
    """Basic server information as defined in the spec"""
    id: str
    name: str
    description: str
    repository: Repository
    version_detail: VersionDetail


class ServerDetail(BaseModel):
    """Detailed server information as defined in the spec"""
    id: str
    name: str
    description: str
    repository: Repository
    version_detail: VersionDetail
    packages: Optional[List[Package]] = None
    remotes: Optional[List[Remote]] = None


class ServerList(BaseModel):
    """Response for listing servers as defined in the spec"""
    servers: List[Server]
    next: Optional[str] = None
    total_count: int


class PublishRequest(BaseModel):
    """Request to publish a server to the registry"""
    id: str
    name: str
    description: str
    repository: Repository
    version_detail: VersionDetail
    packages: Optional[List[Package]] = None
    remotes: Optional[List[Remote]] = None
    auth_status_token: Optional[str] = Field(None, exclude=True)


# Update forward references
Input.model_rebuild()
InputWithVariables.model_rebuild()