from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from .models import APIKey
from rest_framework.authtoken.models import Token

User = get_user_model()


class APIKeyAuthentication(BaseAuthentication):
    """
    Custom authentication class for API keys
    """
    
    def authenticate(self, request):
        # Get the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            return None
            
        # Only handle API keys without 'Token ' prefix
        # This prevents conflicts with DRF TokenAuthentication
        if auth_header.startswith('Token '):
            return None
            
        # Assume the entire header is the API key
        api_key = auth_header
            
        if not api_key:
            return None
            
        try:
            # Check if the API key exists and is active
            api_key_obj = APIKey.objects.select_related('user').get(
                key=api_key,
                is_active=True
            )
            
            # Update last used timestamp
            api_key_obj.update_last_used()
            
            return (api_key_obj.user, api_key_obj)
            
        except APIKey.DoesNotExist:
            raise AuthenticationFailed('Invalid API key')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')


class APIKeyTokenAuthentication(BaseAuthentication):
    """
    Custom authentication class for API keys with 'Token ' prefix
    """
    
    def authenticate(self, request):
        # Get the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            return None
            
        # Only handle headers with 'Token ' prefix
        if not auth_header.startswith('Token '):
            return None
            
        # Extract the key after 'Token '
        api_key = auth_header[6:]  # Remove 'Token ' prefix
            
        if not api_key:
            return None
            
        try:
            # First try to find it as an API key
            api_key_obj = APIKey.objects.select_related('user').get(
                key=api_key,
                is_active=True
            )
            
            # Update last used timestamp
            api_key_obj.update_last_used()
            
            return (api_key_obj.user, api_key_obj)
            
        except APIKey.DoesNotExist:
            # If not found as API key, let other authentication classes handle it
            return None
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')


class TokenAuthentication(BaseAuthentication):
    """
    Custom authentication class for DRF tokens
    """
    
    def authenticate(self, request):
        # Get the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            return None
            
        # Check if it's a Token format
        if auth_header.startswith('Token '):
            token = auth_header[6:]  # Remove 'Token ' prefix
        else:
            return None
            
        if not token:
            return None
            
        try:
            # Check if the token exists
            token_obj = Token.objects.select_related('user').get(key=token)
            return (token_obj.user, token_obj)
            
        except Token.DoesNotExist:
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}') 