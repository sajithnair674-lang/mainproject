
from rest_framework import serializers
from .models import Task, TaskComment,TaskAttachment,ActivityLog,Notification



class TaskSerializer(serializers.ModelSerializer):

    project_name = serializers.CharField(
        source='project.name',
        read_only=True
    )

    assigned_to_username = serializers.CharField(
        source='assigned_to.username',
        read_only=True,
        allow_null=True
    )

    created_by_username = serializers.CharField(
        source='created_by.username',
        read_only=True
    )

    class Meta:
        model = Task
        fields = (
            'id',
            'project',
            'project_name',
            'title',
            'description',
            'assigned_to',
            'assigned_to_username',
            'created_by',
            'created_by_username',
            'priority',
            'status',
            'start_date',
            'due_date',
            'created_at',
            'updated_at',
        )

        read_only_fields = (
            'id',
            'created_by',
            'created_by_username',
            'project_name',
            'assigned_to_username',
            'created_at',
            'updated_at',
        )



class TaskCommentSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    class Meta:
        model = TaskComment
        fields = (
            'id',
            'task',
            'user',
            'username',
            'comment',
            'created_at',
            'updated_at',
        )

        read_only_fields = (
            'id',
            'user',
            'username',
            'created_at',
            'updated_at',
        )


# task attachment

class TaskAttachmentSerializer(serializers.ModelSerializer):

    uploaded_by_username = serializers.CharField(
        source='uploaded_by.username',
        read_only=True
    )

    class Meta:
        model = TaskAttachment
        fields = (
            'id',
            'task',
            'uploaded_by',
            'uploaded_by_username',
            'file',
            'file_name',
            'uploaded_at',
        )

        read_only_fields = (
            'id',
            'uploaded_by',
            'uploaded_by_username',
            'uploaded_at',
        )

    def create(self, validated_data):
        file = validated_data.get('file')

        if not validated_data.get('file_name') and file:
            validated_data['file_name'] = file.name

        return super().create(validated_data)



class ActivityLogSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    class Meta:
        model = ActivityLog
        fields = (
            'id',
            'user',
            'username',
            'action',
            'project',
            'task',
            'description',
            'created_at',
        )

        read_only_fields = (
            'id',
            'user',
            'username',
            'created_at',
        )


class NotificationSerializer(serializers.ModelSerializer):

    recipient_username = serializers.CharField(
        source='recipient.username',
        read_only=True
    )

    class Meta:
        model = Notification

        fields = (
            'id',
            'recipient',
            'recipient_username',
            'message',
            'task',
            'project',
            'is_read',
            'created_at',
        )

        read_only_fields = (
            'id',
            'recipient',
            'recipient_username',
            'created_at',
        )