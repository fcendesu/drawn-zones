import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email as the primary identifier
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email


class MagicLink(models.Model):
    """
    Model to store magic link tokens for passwordless authentication
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='magic_links')
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token', 'is_used']),
            models.Index(fields=['user', 'is_used']),
            models.Index(fields=['expires_at']),
        ]
        
    def save(self, *args, **kwargs):
        if not self.expires_at:
            # Set expiration to 15 minutes from creation
            self.expires_at = timezone.now() + timedelta(minutes=15)
        super().save(*args, **kwargs)
    
    def is_expired(self):
        """Check if the magic link has expired"""
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Check if the magic link is valid (not used and not expired)"""
        return not self.is_used and not self.is_expired()
    
    def mark_as_used(self, ip_address=None, user_agent=None):
        """Mark the magic link as used"""
        self.is_used = True
        self.used_at = timezone.now()
        if ip_address:
            self.ip_address = ip_address
        if user_agent:
            self.user_agent = user_agent
        self.save()
    
    def __str__(self):
        return f"Magic Link for {self.user.email} - {'Used' if self.is_used else 'Active'}"


class APIKey(models.Model):
    """
    Model to store API keys for developer access to zones
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=100, help_text="A descriptive name for this API key")
    key = models.CharField(max_length=64, unique=True, editable=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['key', 'is_active']),
            models.Index(fields=['user', 'is_active']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.key:
            # Generate a unique API key
            self.key = self.generate_key()
        super().save(*args, **kwargs)
    
    def generate_key(self):
        """Generate a unique API key"""
        import secrets
        return secrets.token_urlsafe(32)
    
    def update_last_used(self):
        """Update the last used timestamp"""
        self.last_used_at = timezone.now()
        self.save(update_fields=['last_used_at'])
    
    def __str__(self):
        return f"API Key '{self.name}' for {self.user.email}"
