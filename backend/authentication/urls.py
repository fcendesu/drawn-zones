from django.urls import path
from .views import (
    send_magic_link,
    verify_magic_link,
    user_profile,
    logout,
    auth_status
)

app_name = 'authentication'

urlpatterns = [
    # Magic Link Authentication
    path('magic-link/send/', send_magic_link, name='send_magic_link'),
    path('magic-link/verify/', verify_magic_link, name='verify_magic_link'),
    
    # User Profile
    path('profile/', user_profile, name='user_profile'),
    
    # Authentication Status & Logout
    path('status/', auth_status, name='auth_status'),
    path('logout/', logout, name='logout'),
]
