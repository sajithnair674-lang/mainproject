from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .pagination import TaskPagination, ActivityPagination

from .models import (
    Task,
    TaskComment,
    TaskAttachment,
    ActivityLog,
    Notification
)

from .serializers import (
    TaskSerializer,
    TaskCommentSerializer,
    TaskAttachmentSerializer,
    ActivityLogSerializer,
    NotificationSerializer
)

from projects.models import Project, ProjectMember


class TaskListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    # ==========================================================
    # GET - List Tasks
    # ==========================================================
    def get(self, request):

        user = request.user

        # ADMIN can see all tasks
        if user.role == 'ADMIN':

            tasks = Task.objects.all()

        else:

            tasks = (
                Task.objects.filter(
                    project__members__user=user
                )
                |
                Task.objects.filter(
                    assigned_to=user
                )
                |
                Task.objects.filter(
                    project__created_by=user
                )
            )

        tasks = tasks.distinct().order_by('-created_at')

        # ------------------------------------------------------
        # Search
        # ------------------------------------------------------
        search = request.query_params.get('search')

        if search:

            from django.db.models import Q

            tasks = tasks.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )

        # ------------------------------------------------------
        # Status Filter
        # ------------------------------------------------------
        status_filter = request.query_params.get('status')

        if status_filter:

            tasks = tasks.filter(
                status=status_filter
            )

        # ------------------------------------------------------
        # Priority Filter
        # ------------------------------------------------------
        priority_filter = request.query_params.get('priority')

        if priority_filter:

            tasks = tasks.filter(
                priority=priority_filter
            )

        # ------------------------------------------------------
        # Project Filter
        # ------------------------------------------------------
        project_filter = request.query_params.get('project')

        if project_filter:

            tasks = tasks.filter(
                project_id=project_filter
            )

        # ------------------------------------------------------
        # Pagination
        # ------------------------------------------------------
        paginator = TaskPagination()

        page = paginator.paginate_queryset(
            tasks,
            request
        )

        serializer = TaskSerializer(
            page,
            many=True
        )

        return paginator.get_paginated_response(
            serializer.data
        )

    # ==========================================================
    # POST - Create Task
    # ==========================================================
    def post(self, request):

        # Only ADMIN and MANAGER can create tasks
        if request.user.role not in ['ADMIN', 'MANAGER']:

            return Response(
                {
                    'error': 'Only Admin and Manager can create tasks.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        project_id = request.data.get('project')

        # ------------------------------------------------------
        # Check Project
        # ------------------------------------------------------
        try:

            project = Project.objects.get(
                id=project_id
            )

        except (
            Project.DoesNotExist,
            ValueError,
            TypeError
        ):

            return Response(
                {
                    'error': 'Valid project ID is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ------------------------------------------------------
        # MANAGER Project Access
        # ------------------------------------------------------
        if request.user.role != 'ADMIN':

            has_access = ProjectMember.objects.filter(
                project=project,
                user=request.user
            ).exists()

            if not has_access and project.created_by != request.user:

                return Response(
                    {
                        'error': 'You do not have access to this project.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        # ------------------------------------------------------
        # Validate Task
        # ------------------------------------------------------
        serializer = TaskSerializer(
            data=request.data
        )

        if serializer.is_valid():

            task = serializer.save(
                created_by=request.user
            )

            # --------------------------------------------------
            # Activity Log
            # --------------------------------------------------
            ActivityLog.objects.create(
                user=request.user,
                action='TASK_CREATED',
                task=task,
                project=task.project,
                description=f"Created task '{task.title}'"
            )

            # --------------------------------------------------
            # Notification
            # Notify assigned user when task is created
            # --------------------------------------------------
            if task.assigned_to:

                Notification.objects.create(
                    recipient=task.assigned_to,
                    task=task,
                    project=task.project,
                    message=f"You were assigned a new task: {task.title}"
                )

            return Response(
                TaskSerializer(task).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class TaskDetailView(APIView):

    permission_classes = [IsAuthenticated]

    # ==========================================================
    # Get Task Object
    # ==========================================================
    def get_object(self, pk):

        try:

            return Task.objects.get(
                pk=pk
            )

        except Task.DoesNotExist:

            return None

    # ==========================================================
    # Check Task Access
    # ==========================================================
    def has_access(self, user, task):

        # ADMIN has full access
        if user.role == 'ADMIN':

            return True

        # Assigned user has access
        if task.assigned_to == user:

            return True

        # Project member has access
        return ProjectMember.objects.filter(
            project=task.project,
            user=user
        ).exists()

    # ==========================================================
    # GET - Task Details
    # ==========================================================
    def get(self, request, pk):

        task = self.get_object(pk)

        if task is None:

            return Response(
                {
                    'error': 'Task not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not self.has_access(
            request.user,
            task
        ):

            return Response(
                {
                    'error': 'You do not have access to this task.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TaskSerializer(task)

        return Response(
            serializer.data
        )

    # ==========================================================
    # PUT - Update Task
    # ==========================================================
    def put(self, request, pk):

        task = self.get_object(pk)

        if task is None:

            return Response(
                {
                    'error': 'Task not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user

        # ------------------------------------------------------
        # Save old assigned user
        # Used to detect assignment changes
        # ------------------------------------------------------
        old_assignee = task.assigned_to

        # ------------------------------------------------------
        # MEMBER
        # ------------------------------------------------------
        if user.role == 'MEMBER':

            if task.assigned_to != user:

                return Response(
                    {
                        'error': 'You can only update tasks assigned to you.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        # ------------------------------------------------------
        # MANAGER
        # ------------------------------------------------------
        elif user.role == 'MANAGER':

            has_access = ProjectMember.objects.filter(
                project=task.project,
                user=user
            ).exists()

            if not has_access and task.project.created_by != user:

                return Response(
                    {
                        'error': 'You do not have access to this project.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        # ------------------------------------------------------
        # ADMIN automatically has access
        # ------------------------------------------------------

        serializer = TaskSerializer(
            task,
            data=request.data
        )

        if serializer.is_valid():

            task = serializer.save()

            # --------------------------------------------------
            # Activity Log
            # --------------------------------------------------
            ActivityLog.objects.create(
                user=request.user,
                action='TASK_UPDATED',
                task=task,
                project=task.project,
                description=f"Updated task '{task.title}'"
            )

            # --------------------------------------------------
            # Notification
            # Notify only if assignee changed
            # --------------------------------------------------
            if (
                task.assigned_to
                and task.assigned_to != old_assignee
            ):

                Notification.objects.create(
                    recipient=task.assigned_to,
                    task=task,
                    project=task.project,
                    message=f"You were assigned a new task: {task.title}"
                )

            return Response(
                TaskSerializer(task).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # ==========================================================
    # DELETE - Delete Task
    # ==========================================================
    def delete(self, request, pk):

        task = self.get_object(pk)

        if task is None:

            return Response(
                {
                    'error': 'Task not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ------------------------------------------------------
        # Only ADMIN and MANAGER
        # ------------------------------------------------------
        if request.user.role not in ['ADMIN', 'MANAGER']:

            return Response(
                {
                    'error': 'Only Admin and Manager can delete tasks.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ------------------------------------------------------
        # MANAGER Project Access
        # ------------------------------------------------------
        if request.user.role == 'MANAGER':

            has_access = ProjectMember.objects.filter(
                project=task.project,
                user=request.user
            ).exists()

            if not has_access and task.project.created_by != request.user:

                return Response(
                    {
                        'error': 'You do not have access to this project.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        # ------------------------------------------------------
        # Save information before deleting
        # ------------------------------------------------------
        task_title = task.title
        project = task.project

        # ------------------------------------------------------
        # Activity Log
        # ------------------------------------------------------
        ActivityLog.objects.create(
            user=request.user,
            action='TASK_DELETED',
            project=project,
            description=f"Deleted task '{task_title}'"
        )

        task.delete()

        return Response(
            {
                'message': 'Task deleted successfully.'
            },
            status=status.HTTP_204_NO_CONTENT
        )


class TaskCommentListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    # ==========================================================
    # Get Task
    # ==========================================================
    def get_task(self, task_id):

        try:

            return Task.objects.get(
                id=task_id
            )

        except Task.DoesNotExist:

            return None

    # ==========================================================
    # Check Access
    # ==========================================================
    def has_access(self, user, task):

        if user.role == 'ADMIN':

            return True

        if task.assigned_to == user:

            return True

        return ProjectMember.objects.filter(
            project=task.project,
            user=user
        ).exists()

    # ==========================================================
    # GET - List Comments
    # ==========================================================
    def get(self, request, task_id):

        task = self.get_task(task_id)

        if task is None:

            return Response(
                {
                    'error': 'Task not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not self.has_access(
            request.user,
            task
        ):

            return Response(
                {
                    'error': 'You do not have access to this task.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        comments = TaskComment.objects.filter(
            task=task
        ).order_by('created_at')

        serializer = TaskCommentSerializer(
            comments,
            many=True
        )

        return Response(
            serializer.data
        )

    # ==========================================================
    # POST - Add Comment
    # ==========================================================
    def post(self, request, task_id):

        task = self.get_task(task_id)

        if task is None:

            return Response(
                {
                    'error': 'Task not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not self.has_access(
            request.user,
            task
        ):

            return Response(
                {
                    'error': 'You do not have access to this task.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TaskCommentSerializer(
            data={
                'task': task.id,
                'comment': request.data.get('comment')
            }
        )

        if serializer.is_valid():

            comment = serializer.save(
                user=request.user
            )

            # --------------------------------------------------
            # Activity Log
            # --------------------------------------------------
            ActivityLog.objects.create(
                user=request.user,
                action='COMMENT_ADDED',
                task=task,
                project=task.project,
                description=f"Added a comment to task '{task.title}'"
            )

            return Response(
                TaskCommentSerializer(comment).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class TaskAttachmentListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    # ==========================================================
    # Get Task
    # ==========================================================
    def get_task(self, task_id):

        try:

            return Task.objects.get(
                id=task_id
            )

        except Task.DoesNotExist:

            return None

    # ==========================================================
    # Check Access
    # ==========================================================
    def has_access(self, user, task):

        if user.role == 'ADMIN':

            return True

        if task.assigned_to == user:

            return True

        return ProjectMember.objects.filter(
            project=task.project,
            user=user
        ).exists()

    # ==========================================================
    # GET - List Attachments
    # ==========================================================
    def get(self, request, task_id):

        task = self.get_task(task_id)

        if task is None:

            return Response(
                {
                    'error': 'Task not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not self.has_access(
            request.user,
            task
        ):

            return Response(
                {
                    'error': 'You do not have access to this task.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        attachments = TaskAttachment.objects.filter(
            task=task
        ).order_by('-uploaded_at')

        serializer = TaskAttachmentSerializer(
            attachments,
            many=True,
            context={
                'request': request
            }
        )

        return Response(
            serializer.data
        )

    # ==========================================================
    # POST - Upload Attachment
    # ==========================================================
    def post(self, request, task_id):

        task = self.get_task(task_id)

        if task is None:

            return Response(
                {
                    'error': 'Task not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not self.has_access(
            request.user,
            task
        ):

            return Response(
                {
                    'error': 'You do not have access to this task.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TaskAttachmentSerializer(
            data={
                'task': task.id,
                'file': request.FILES.get('file'),
                'file_name': request.data.get(
                    'file_name',
                    ''
                )
            }
        )

        if serializer.is_valid():

            attachment = serializer.save(
                uploaded_by=request.user
            )

            # --------------------------------------------------
            # Activity Log
            # --------------------------------------------------
            ActivityLog.objects.create(
                user=request.user,
                action='ATTACHMENT_ADDED',
                task=task,
                project=task.project,
                description=f"Added attachment to task '{task.title}'"
            )

            return Response(
                TaskAttachmentSerializer(
                    attachment,
                    context={
                        'request': request
                    }
                ).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ActivityLogListView(APIView):

    permission_classes = [IsAuthenticated]

    # ==========================================================
    # GET - Activity Logs
    # ==========================================================
    def get(self, request):

        if request.user.role == 'ADMIN':

            activities = ActivityLog.objects.all()

        else:

            activities = ActivityLog.objects.filter(
                user=request.user
            )

        activities = activities.order_by(
            '-created_at'
        )

        # ------------------------------------------------------
        # Action Filter
        # ------------------------------------------------------
        action = request.query_params.get('action')

        if action:

            activities = activities.filter(
                action=action
            )

        # ------------------------------------------------------
        # Pagination
        # ------------------------------------------------------
        paginator = ActivityPagination()

        page = paginator.paginate_queryset(
            activities,
            request
        )

        serializer = ActivityLogSerializer(
            page,
            many=True
        )

        return paginator.get_paginated_response(
            serializer.data
        )


class NotificationListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        notifications = Notification.objects.filter(
            recipient=request.user
        ).order_by('-created_at')

        serializer = NotificationSerializer(
            notifications,
            many=True
        )

        return Response(serializer.data)

    def patch(self, request, pk):

        try:
            notification = Notification.objects.get(
                id=pk,
                recipient=request.user
            )
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        notification.is_read = True
        notification.save()

        return Response({
            'message': 'Notification marked as read.',
            'id': notification.id,
            'is_read': notification.is_read
        })



class NotificationUnreadCountView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()

        return Response({
            'unread_count': count
        })