from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from .models import MagicLink, APIKey
import re

User = get_user_model()


class SendMagicLinkSerializer(serializers.Serializer):
    """
    Serializer for requesting a magic link
    """
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """Validate email format"""
        # Clean and validate email
        email = value.lower().strip()
        
        # Basic email validation
        validate_email(email)
        
        # Additional email format validation
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            raise serializers.ValidationError("Invalid email format")
        
        return email


class VerifyMagicLinkSerializer(serializers.Serializer):
    """
    Serializer for verifying a magic link token
    """
    token = serializers.UUIDField()
    
    def validate_token(self, value):
        """Validate that the token exists and is valid"""
        try:
            magic_link = MagicLink.objects.select_related('user').get(token=value)
            
            if magic_link.is_used:
                raise serializers.ValidationError("This magic link has already been used.")
            
            if magic_link.is_expired():
                raise serializers.ValidationError("This magic link has expired. Please request a new one.")
            
            # Store the magic link in context for use in the view
            self.context['magic_link'] = magic_link
            return value
            
        except MagicLink.DoesNotExist:
            raise serializers.ValidationError("Invalid magic link token.")


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    """
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'full_name', 'is_email_verified', 'created_at', 'date_joined'
        ]
        read_only_fields = ['id', 'created_at', 'date_joined', 'is_email_verified']
    
    def get_full_name(self, obj):
        """Get user's full name"""
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.first_name or obj.last_name or obj.email


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile updates
    """
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username']
        
    def validate_username(self, value):
        """Ensure username is unique"""
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value


class MagicLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = MagicLink
        fields = ['token', 'created_at', 'expires_at', 'is_used', 'used_at']
        read_only_fields = ['token', 'created_at', 'expires_at', 'is_used', 'used_at']


class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ['id', 'name', 'key', 'created_at', 'last_used_at', 'is_active']
        read_only_fields = ['id', 'key', 'created_at', 'last_used_at']


class APIKeyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ['name']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
