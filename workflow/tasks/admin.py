from django.contrib import admin
from .models import Task, TaskComment, TaskAttachment,ActivityLog,Notification


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):

    list_display = (
        'title',
        'project',
        'assigned_to',
        'created_by',
        'priority',
        'status',
        'due_date',
    )

    list_filter = (
        'status',
        'priority',
        'project',
        'due_date',
    )

    search_fields = (
        'title',
        'description',
        'project__name',
        'assigned_to__username',
        'created_by__username',
    )


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):

    list_display = (
        'task',
        'user',
        'created_at',
    )

    search_fields = (
        'comment',
        'task__title',
        'user__username',
    )


@admin.register(TaskAttachment)
class TaskAttachmentAdmin(admin.ModelAdmin):

    list_display = (
        'task',
        'uploaded_by',
        'file_name',
        'uploaded_at',
    )

    search_fields = (
        'file_name',
        'task__title',
        'uploaded_by__username',
    )



@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'action',
        'project',
        'task',
        'created_at',
    )

    list_filter = (
        'action',
        'created_at',
    )

    search_fields = (
        'user__username',
        'description',
    )

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):

    list_display = (
        'recipient',
        'message',
        'is_read',
        'created_at',
    )

    list_filter = (
        'is_read',
        'created_at',
    )

    search_fields = (
        'recipient__username',
        'message',
    )