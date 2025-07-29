from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import MagicLink
from .serializers import (
    SendMagicLinkSerializer, 
    VerifyMagicLinkSerializer, 
    UserSerializer,
    UserProfileSerializer
)
from .services import MagicLinkEmailService
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def send_magic_link(request):
    """
    Send magic link to user's email
    
    POST /api/auth/magic-link/send/
    {
        "email": "user@example.com"
    }
    """
    serializer = SendMagicLinkSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'errors': serializer.errors}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    email = serializer.validated_data['email']
    
    try:
        with transaction.atomic():
            # Get or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,  # Use email as username initially
                    'is_active': True,
                }
            )
            
            # Invalidate any existing unused magic links for this user
            MagicLink.objects.filter(
                user=user, 
                is_used=False
            ).update(is_used=True, used_at=timezone.now())
            
            # Create new magic link
            magic_link = MagicLink.objects.create(
                user=user,
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # Send magic link email
            email_sent = MagicLinkEmailService.send_magic_link(user, magic_link, request)
            
            if email_sent:
                # Welcome email disabled per user request
                # if created:
                #     MagicLinkEmailService.send_welcome_email(user)
                
                logger.info(f"Magic link sent successfully to {email} (new_user: {created})")
                
                return Response({
                    'message': 'Magic link sent successfully! Check your email.',
                    'email': email,
                    'expires_in_minutes': 15,
                    'new_user': created
                }, status=status.HTTP_200_OK)
            else:
                logger.error(f"Failed to send email to {email}")
                return Response({
                    'error': 'Failed to send email. Please try again later.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
    except Exception as e:
        logger.error(f"Error in send_magic_link for {email}: {str(e)}")
        return Response({
            'error': 'An unexpected error occurred. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def verify_magic_link(request):
    """
    Verify magic link token and authenticate user
    
    POST /api/auth/magic-link/verify/
    {
        "token": "uuid-token-here"
    }
    """
    serializer = VerifyMagicLinkSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if not serializer.is_valid():
        return Response(
            {'errors': serializer.errors}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        with transaction.atomic():
            # Get the magic link from serializer context
            magic_link = serializer.context['magic_link']
            user = magic_link.user
            
            # Mark magic link as used
            magic_link.mark_as_used(
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # Mark user email as verified
            if not user.is_email_verified:
                user.is_email_verified = True
                user.save(update_fields=['is_email_verified'])
            
            # Create or get authentication token for API access
            auth_token, token_created = Token.objects.get_or_create(user=user)
            
            # Prepare user data
            user_serializer = UserSerializer(user)
            
            logger.info(f"User {user.email} successfully authenticated via magic link")
            
            return Response({
                'message': 'Authentication successful!',
                'user': user_serializer.data,
                'token': auth_token.key,
                'token_created': token_created
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        logger.error(f"Error in verify_magic_link: {str(e)}")
        return Response({
            'error': 'An unexpected error occurred during authentication.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get or update current user profile
    
    GET /api/auth/profile/ - Get current user profile
    PUT /api/auth/profile/ - Update current user profile
    """
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(
            request.user, 
            data=request.data, 
            context={'request': request},
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            # Return updated user data
            user_serializer = UserSerializer(request.user)
            return Response({
                'message': 'Profile updated successfully!',
                'user': user_serializer.data
            })
        
        return Response(
            {'errors': serializer.errors}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout user by deleting their authentication token
    
    POST /api/auth/logout/
    """
    try:
        # Delete the user's token
        Token.objects.filter(user=request.user).delete()
        
        logger.info(f"User {request.user.email} logged out successfully")
        
        return Response({
            'message': 'Successfully logged out.'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error during logout for user {request.user.email}: {str(e)}")
        return Response({
            'error': 'An error occurred during logout.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_status(request):
    """
    Check authentication status and return user data
    
    GET /api/auth/status/
    """
    try:
        serializer = UserSerializer(request.user)
        return Response({
            'authenticated': True,
            'user': serializer.data
        })
    except Exception as e:
        logger.error(f"Error in auth_status for user {request.user.email}: {str(e)}")
        return Response({
            'authenticated': False,
            'error': 'Unable to fetch user data'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
