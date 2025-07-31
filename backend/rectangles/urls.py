from django.urls import path
from . import views

app_name = 'rectangles'

urlpatterns = [
    # List and create rectangles
    path('', views.RectangleListCreateView.as_view(), name='rectangle-list-create'),
    
    # Retrieve, update, delete specific rectangle
    path('<int:pk>/', views.RectangleDetailView.as_view(), name='rectangle-detail'),
    
    # Statistics
    path('stats/', views.rectangle_stats, name='rectangle-stats'),
] 