from abc import ABC, abstractmethod

from ..models import Authentication


class AuthError(Exception):
    """Base class for authentication errors"""
    pass


class AuthRequiredError(AuthError):
    """Authentication is required but not provided"""
    pass


class AuthService(ABC):
    """Abstract base class for authentication services"""

    @abstractmethod
    async def validate_auth(self, auth: Authentication) -> bool:
        """
        Validate authentication credentials
        
        Args:
            auth: Authentication information
            
        Returns:
            True if authentication is valid, False otherwise
            
        Raises:
            AuthError: If there's an error during authentication
            AuthRequiredError: If authentication is required but not provided
        """
        pass


class NoOpAuthService(AuthService):
    """No-operation auth service that allows all requests"""

    async def validate_auth(self, auth: Authentication) -> bool:
        """Always return True (no authentication required)"""
        return True


class SimpleTokenAuthService(AuthService):
    """Simple token-based authentication service"""

    def __init__(self, valid_tokens: list[str]):
        self.valid_tokens = set(valid_tokens)

    async def validate_auth(self, auth: Authentication) -> bool:
        """Validate against a list of valid tokens"""
        if not auth.token:
            raise AuthRequiredError("Token is required")
        
        return auth.token in self.valid_tokens