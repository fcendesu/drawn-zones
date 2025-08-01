from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login
from django.utils import timezone
from datetime import timedelta
import logging

from .models import User, MagicLink, APIKey
from .serializers import (
    UserSerializer, 
    MagicLinkSerializer, 
    SendMagicLinkSerializer, 
    VerifyMagicLinkSerializer,
    APIKeySerializer,
    APIKeyCreateSerializer
)
from .services import MagicLinkEmailService

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_magic_link(request):
    """
    Send a magic link to the provided email address
    """
    serializer = SendMagicLinkSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            # Get or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': email}
            )
            
            # Create magic link
            magic_link = MagicLink.objects.create(
                user=user,
                expires_at=timezone.now() + timedelta(minutes=15)
            )
            
            # Send email
            MagicLinkEmailService.send_magic_link(user, magic_link, request)
            
            return Response({
                'message': 'Magic link sent successfully! Check your email.',
                'email': email,
                'expires_in_minutes': 15,
                'new_user': created
            })
            
        except Exception as e:
            logger.error(f"Error in send_magic_link for {email}: {str(e)}")
            return Response(
                {'error': 'Failed to send magic link. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_magic_link(request):
    """
    Verify magic link token and authenticate user
    """
    serializer = VerifyMagicLinkSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        
        try:
            magic_link = MagicLink.objects.get(token=token)
            
            if not magic_link.is_valid():
                return Response(
                    {'error': 'Invalid or expired magic link.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mark as used
            magic_link.mark_as_used(
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # Get or create token for API access
            token_obj, created = Token.objects.get_or_create(user=magic_link.user)
            
            return Response({
                'message': 'Successfully authenticated!',
                'token': token_obj.key,
                'user': UserSerializer(magic_link.user).data
            })
            
        except MagicLink.DoesNotExist:
            return Response(
                {'error': 'Invalid magic link token.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error in verify_magic_link: {str(e)}")
            return Response(
                {'error': 'Authentication failed. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get current user profile
    """
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout user by deleting their token
    """
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out.'})
    except:
        return Response({'message': 'Successfully logged out.'})


class APIKeyListCreateView(generics.ListCreateAPIView):
    """
    List and create API keys for the authenticated user
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return APIKeyCreateSerializer
        return APIKeySerializer
    
    def get_queryset(self):
        return APIKey.objects.filter(user=self.request.user, is_active=True)
    
    def create(self, request, *args, **kwargs):
        """
        Create a new API key and return the full serialized data
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        api_key = serializer.save(user=request.user)
        
        # Return the full serialized data including the generated key
        response_serializer = APIKeySerializer(api_key)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class APIKeyDetailView(generics.DestroyAPIView):
    """
    Delete an API key
    """
    permission_classes = [IsAuthenticated]
    serializer_class = APIKeySerializer
    
    def get_queryset(self):
        return APIKey.objects.filter(user=self.request.user)
    
    def perform_destroy(self, instance):
        # Soft delete by setting is_active to False
        instance.is_active = False
        instance.save()
