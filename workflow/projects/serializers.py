from rest_framework import serializers
from .models import Project,ProjectMember


class ProjectSerializer(serializers.ModelSerializer):

    created_by_username = serializers.CharField(
        source='created_by.username',
        read_only=True
    )

    class Meta:
        model = Project
        fields = (
            'id',
            'name',
            'description',
            'created_by',
            'created_by_username',
            'start_date',
            'due_date',
            'status',
            'created_at',
            'updated_at',
        )

        read_only_fields = (
            'id',
            'created_by',
            'created_by_username',
            'created_at',
            'updated_at',
        )


class ProjectMemberSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    email = serializers.EmailField(
        source='user.email',
        read_only=True
    )



    # Allow Admin/Manager to add users to a project and view the members of a project.


    class Meta:
        model = ProjectMember
        fields = (
            'id',
            'project',
            'user',
            'username',
            'email',
            'joined_at',
        )

        read_only_fields = (
            'id',
            'username',
            'email',
            'joined_at',
        )