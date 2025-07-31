from rest_framework import serializers
from .models import Rectangle


class RectangleSerializer(serializers.ModelSerializer):
    """
    Serializer for Rectangle model
    """
    center_coordinates = serializers.ReadOnlyField()
    
    class Meta:
        model = Rectangle
        fields = [
            'id', 'name', 'coordinates', 'center_coordinates',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'center_coordinates']
    
    def validate_coordinates(self, value):
        """Validate that coordinates are valid GeoJSON"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Coordinates must be a valid GeoJSON object")
        
        if value.get('type') != 'Polygon':
            raise serializers.ValidationError("Coordinates must be a Polygon type")
        
        if 'coordinates' not in value or not value['coordinates']:
            raise serializers.ValidationError("Coordinates must contain coordinates array")
        
        coords = value['coordinates']
        if not isinstance(coords, list) or len(coords) == 0:
            raise serializers.ValidationError("Coordinates must be a non-empty array")
        
        # Validate that we have at least 4 points for a rectangle
        if len(coords[0]) < 4:
            raise serializers.ValidationError("Rectangle must have at least 4 coordinate points")
        
        return value


class RectangleCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating rectangles
    """
    class Meta:
        model = Rectangle
        fields = ['name', 'coordinates']
    
    def validate_name(self, value):
        """Validate rectangle name"""
        if not value or not value.strip():
            raise serializers.ValidationError("Name cannot be empty")
        
        # Check if user already has a rectangle with this name
        user = self.context['request'].user
        if Rectangle.objects.filter(user=user, name=value.strip()).exists():
            raise serializers.ValidationError("You already have a rectangle with this name")
        
        return value.strip()
    
    def validate_coordinates(self, value):
        """Validate that coordinates are valid GeoJSON"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Coordinates must be a valid GeoJSON object")
        
        if value.get('type') != 'Polygon':
            raise serializers.ValidationError("Coordinates must be a Polygon type")
        
        if 'coordinates' not in value or not value['coordinates']:
            raise serializers.ValidationError("Coordinates must contain coordinates array")
        
        coords = value['coordinates']
        if not isinstance(coords, list) or len(coords) == 0:
            raise serializers.ValidationError("Coordinates must be a non-empty array")
        
        # Validate that we have at least 4 points for a rectangle
        if len(coords[0]) < 4:
            raise serializers.ValidationError("Rectangle must have at least 4 coordinate points")
        
        return value 