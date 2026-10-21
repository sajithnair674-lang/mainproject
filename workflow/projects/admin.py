from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Project, ProjectMember


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'created_by',
        'status',
        'start_date',
        'due_date',
    )

    list_filter = (
        'status',
        'start_date',
        'due_date',
    )

    search_fields = (
        'name',
        'description',
        'created_by__username',
    )


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = (
        'project',
        'user',
        'joined_at',
    )

    list_filter = (
        'project',
    )

    search_fields = (
        'project__name',
        'user__username',
    )