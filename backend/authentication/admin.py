from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, MagicLink


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for custom User model"""
    
    list_display = ('email', 'username', 'first_name', 'last_name', 
                   'is_email_verified', 'is_active', 'is_staff', 'created_at')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'is_email_verified', 'created_at')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_email_verified',
                      'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'created_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')


@admin.register(MagicLink)
class MagicLinkAdmin(admin.ModelAdmin):
    """Admin configuration for MagicLink model"""
    
    list_display = ('user_email', 'token_short', 'created_at', 'expires_at', 'is_used', 'used_at', 'is_expired_display')
    list_filter = ('is_used', 'created_at', 'expires_at')
    search_fields = ('user__email', 'user__username', 'token')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {
            'fields': ('user', 'token')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'expires_at', 'is_used', 'used_at')
        }),
        ('Usage Info', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('token', 'created_at', 'used_at')
    
    def user_email(self, obj):
        """Display user email in list view"""
        return obj.user.email
    user_email.short_description = 'User Email'
    user_email.admin_order_field = 'user__email'
    
    def token_short(self, obj):
        """Display shortened token in list view"""
        return f"{str(obj.token)[:8]}..."
    token_short.short_description = 'Token'
    
    def is_expired_display(self, obj):
        """Display if token is expired"""
        return obj.is_expired()
    is_expired_display.short_description = 'Expired'
    is_expired_display.boolean = True
    
    def has_add_permission(self, request):
        """Disable adding magic links through admin"""
        return False
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related('user')
