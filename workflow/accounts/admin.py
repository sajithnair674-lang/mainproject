from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from accounts.models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'role',
        'is_staff',
        'is_active',
    )

    list_filter = (
        'role',
        'is_staff',
        'is_active',
    )

    fieldsets = UserAdmin.fieldsets + (
        ('WorkFlow Information', {
            'fields': ('role', 'profile_image', 'created_at')
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('WorkFlow Information', {
            'fields': ('role', 'profile_image')
        }),
    )