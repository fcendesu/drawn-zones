from django.urls import path
from . import views

app_name = 'authentication'

urlpatterns = [
    # Magic link authentication
    path('magic-link/send/', views.send_magic_link, name='send_magic_link'),
    path('magic-link/verify/', views.verify_magic_link, name='verify_magic_link'),
    
    # User profile and logout
    path('profile/', views.user_profile, name='user_profile'),
    path('logout/', views.logout, name='logout'),
    
    # API Key management
    path('api-keys/', views.APIKeyListCreateView.as_view(), name='api_key_list_create'),
    path('api-keys/<int:pk>/', views.APIKeyDetailView.as_view(), name='api_key_detail'),
]
