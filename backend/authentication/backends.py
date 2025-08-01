from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from .models import APIKey

User = get_user_model()


class APIKeyBackend(BaseBackend):
    """
    Custom authentication backend for API keys
    """
    
    def authenticate(self, request, api_key=None):
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
            
            return api_key_obj.user
            
        except APIKey.DoesNotExist:
            return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


class TokenBackend(BaseBackend):
    """
    Custom authentication backend for DRF tokens
    """
    
    def authenticate(self, request, token=None):
        if not token:
            return None
            
        try:
            # Check if the token exists
            token_obj = Token.objects.select_related('user').get(key=token)
            return token_obj.user
            
        except Token.DoesNotExist:
            return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None 