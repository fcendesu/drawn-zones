"""
URL configuration for drawnzones project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """API root endpoint with available endpoints"""
    return Response({
        'message': 'DrawnZones API v1.0',
        'version': '1.0',
        'endpoints': {
            'authentication': {
                'send_magic_link': '/api/auth/magic-link/send/',
                'verify_magic_link': '/api/auth/magic-link/verify/',
                'profile': '/api/auth/profile/',
                'status': '/api/auth/status/',
                'logout': '/api/auth/logout/',
            },
            'admin': '/admin/',
            'api_auth': '/api-auth/',
        },
        'documentation': {
            'magic_link_flow': {
                '1': 'POST /api/auth/magic-link/send/ with {"email": "user@example.com"}',
                '2': 'Check email for magic link',
                '3': 'POST /api/auth/magic-link/verify/ with {"token": "uuid-token"}',
                '4': 'Use returned token in Authorization header: "Token your-token-here"'
            }
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),  # DRF login/logout views
    path('api/auth/', include('authentication.urls')),  # Our authentication endpoints
    path('api/', api_root, name='api_root'),  # API root
]
