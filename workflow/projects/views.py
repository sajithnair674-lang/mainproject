from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer
from tasks.models import ActivityLog


from django.contrib.auth import get_user_model
User = get_user_model()


class ProjectListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.all()

        serializer = ProjectSerializer(
            projects,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        if request.user.role not in ['ADMIN', 'MANAGER']:
            return Response(
                {
                    'error': 'Only Admin and Manager can create projects.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProjectSerializer(
            data=request.data
        )

        if serializer.is_valid():
            project = serializer.save(
                created_by=request.user
            )

            ActivityLog.objects.create(
                user=request.user,
                action='PROJECT_CREATED',
                project=project,
                description=f"Created project '{project.name}'"
            )

            return Response(
                ProjectSerializer(project).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ProjectDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return None

    def get(self, request, pk):

        project = self.get_object(pk)

        if project is None:
            return Response(
                {'error': 'Project not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProjectSerializer(project)

        return Response(serializer.data)

    def put(self, request, pk):

        if request.user.role not in ['ADMIN', 'MANAGER']:
            return Response(
                {
                    'error': 'Only Admin and Manager can update projects.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        project = self.get_object(pk)

        if project is None:
            return Response(
                {'error': 'Project not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProjectSerializer(
            project,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):

        if request.user.role not in ['ADMIN', 'MANAGER']:
            return Response(
                {
                    'error': 'Only Admin and Manager can delete projects.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        project = self.get_object(pk)

        if project is None:
            return Response(
                {'error': 'Project not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        project.delete()

        return Response(
            {
                'message': 'Project deleted successfully.'
            },
            status=status.HTTP_204_NO_CONTENT
        )


#     allow Admin/Manager to add users to a project and view the members of a project.

class ProjectMemberListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        members = ProjectMember.objects.filter(
            project=project
        )

        serializer = ProjectMemberSerializer(
            members,
            many=True
        )

        return Response(serializer.data)

    def post(self, request, project_id):

        if request.user.role not in ['ADMIN', 'MANAGER']:
            return Response(
                {
                    'error': 'Only Admin and Manager can add project members.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        user_id = request.data.get('user')

        if not user_id:
            return Response(
                {'error': 'User ID is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if ProjectMember.objects.filter(
            project=project,
            user=user
        ).exists():
            return Response(
                {
                    'error': 'User is already a member of this project.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        member = ProjectMember.objects.create(
            project=project,
            user=user
        )

        serializer = ProjectMemberSerializer(member)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )