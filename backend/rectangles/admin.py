from django.contrib import admin
from .models import Rectangle


@admin.register(Rectangle)
class RectangleAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['name', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name')
        }),
        ('Geographic Data', {
            'fields': ('coordinates',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 