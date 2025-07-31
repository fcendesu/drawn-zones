from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinLengthValidator

User = get_user_model()


class Rectangle(models.Model):
    """
    Model to store drawn rectangles/zones on the map
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rectangles')
    name = models.CharField(
        max_length=100, 
        validators=[MinLengthValidator(1, "Name cannot be empty")]
    )
    coordinates = models.JSONField(
        help_text="GeoJSON coordinates for the rectangle"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.user.email}"
    
    @property
    def center_coordinates(self):
        """Calculate center point of the rectangle"""
        if not self.coordinates or 'coordinates' not in self.coordinates:
            return None
        
        coords = self.coordinates['coordinates'][0]  # First ring of polygon
        if len(coords) < 4:  # Need at least 4 points for a rectangle
            return None
        
        # Calculate center from first and third points (diagonal)
        lng1, lat1 = coords[0]
        lng2, lat2 = coords[2]
        
        center_lng = (lng1 + lng2) / 2
        center_lat = (lat1 + lat2) / 2
        
        return [center_lng, center_lat] 