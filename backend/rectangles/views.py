from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Rectangle
from .serializers import RectangleSerializer, RectangleCreateSerializer
import logging

logger = logging.getLogger(__name__)


class RectangleListCreateView(generics.ListCreateAPIView):
    """
    List all rectangles for the authenticated user and create new rectangles
    """
    permission_classes = [IsAuthenticated]
    serializer_class = RectangleSerializer
    
    def get_queryset(self):
        """Return rectangles for the authenticated user"""
        return Rectangle.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializer for create vs list"""
        if self.request.method == 'POST':
            return RectangleCreateSerializer
        return RectangleSerializer
    
    def perform_create(self, serializer):
        """Save the rectangle with the current user"""
        rectangle = serializer.save(user=self.request.user)
        logger.info(f"Rectangle '{rectangle.name}' created by user {self.request.user.email}")
    
    def create(self, request, *args, **kwargs):
        """Override create to return full object with ID"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return the full object using RectangleSerializer
        full_serializer = RectangleSerializer(serializer.instance)
        return Response(full_serializer.data, status=status.HTTP_201_CREATED)


class RectangleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific rectangle
    """
    permission_classes = [IsAuthenticated]
    serializer_class = RectangleSerializer
    
    def get_queryset(self):
        """Return rectangles for the authenticated user"""
        return Rectangle.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        """Log rectangle updates"""
        logger.info(f"Rectangle '{serializer.instance.name}' updated by user {self.request.user.email}")
        serializer.save()
    
    def perform_destroy(self, instance):
        """Log rectangle deletion"""
        name = instance.name
        logger.info(f"Rectangle '{name}' deleted by user {self.request.user.email}")
        instance.delete()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rectangle_stats(request):
    """
    Get statistics about user's rectangles
    """
    user_rectangles = Rectangle.objects.filter(user=request.user)
    
    stats = {
        'total_rectangles': user_rectangles.count(),
        'recent_rectangles': user_rectangles.order_by('-created_at')[:5].count(),
    }
    
    return Response(stats, status=status.HTTP_200_OK) 