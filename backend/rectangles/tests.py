from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Rectangle

User = get_user_model()


class RectangleModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        
        self.rectangle_data = {
            'type': 'Polygon',
            'coordinates': [[
                [-74.006, 40.7128],
                [-74.006, 40.7228],
                [-73.996, 40.7228],
                [-73.996, 40.7128],
                [-74.006, 40.7128]
            ]]
        }

    def test_create_rectangle(self):
        """Test creating a rectangle"""
        rectangle = Rectangle.objects.create(
            user=self.user,
            name='Test Rectangle',
            coordinates=self.rectangle_data
        )
        
        self.assertEqual(rectangle.name, 'Test Rectangle')
        self.assertEqual(rectangle.user, self.user)
        self.assertEqual(rectangle.coordinates, self.rectangle_data)
        self.assertIsNotNone(rectangle.created_at)
        self.assertIsNotNone(rectangle.updated_at)

    def test_rectangle_string_representation(self):
        """Test rectangle string representation"""
        rectangle = Rectangle.objects.create(
            user=self.user,
            name='Test Rectangle',
            coordinates=self.rectangle_data
        )
        
        expected = f"Test Rectangle - {self.user.email}"
        self.assertEqual(str(rectangle), expected)

    def test_center_coordinates_calculation(self):
        """Test center coordinates calculation"""
        rectangle = Rectangle.objects.create(
            user=self.user,
            name='Test Rectangle',
            coordinates=self.rectangle_data
        )
        
        center = rectangle.center_coordinates
        self.assertIsNotNone(center)
        self.assertEqual(len(center), 2)
        self.assertIsInstance(center[0], float)
        self.assertIsInstance(center[1], float)


class RectangleAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='testpass123'
        )
        
        self.rectangle_data = {
            'type': 'Polygon',
            'coordinates': [[
                [-74.006, 40.7128],
                [-74.006, 40.7228],
                [-73.996, 40.7228],
                [-73.996, 40.7128],
                [-74.006, 40.7128]
            ]]
        }
        
        # Create a test rectangle
        self.rectangle = Rectangle.objects.create(
            user=self.user,
            name='Test Rectangle',
            coordinates=self.rectangle_data
        )

    def test_get_rectangles_authenticated(self):
        """Test getting rectangles when authenticated"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/rectangles/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Rectangle')

    def test_get_rectangles_unauthenticated(self):
        """Test getting rectangles when not authenticated"""
        response = self.client.get('/api/rectangles/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_rectangle_authenticated(self):
        """Test creating a rectangle when authenticated"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'name': 'New Rectangle',
            'coordinates': self.rectangle_data
        }
        
        response = self.client.post('/api/rectangles/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Rectangle')
        self.assertEqual(Rectangle.objects.count(), 2)

    def test_create_rectangle_invalid_data(self):
        """Test creating a rectangle with invalid data"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'name': '',  # Empty name
            'coordinates': self.rectangle_data
        }
        
        response = self.client.post('/api/rectangles/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_rectangle(self):
        """Test deleting a rectangle"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.delete(f'/api/rectangles/{self.rectangle.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Rectangle.objects.count(), 0) 