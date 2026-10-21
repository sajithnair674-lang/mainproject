from django.db.models import Q

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import Project
from tasks.models import Task


class DashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        # -------------------------
        # Projects
        # -------------------------

        if user.role == 'ADMIN':

            projects = Project.objects.all()

        else:

            projects = Project.objects.filter(
                Q(created_by=user) |
                Q(members__user=user)
            ).distinct()

        # -------------------------
        # Tasks
        # -------------------------

        if user.role == 'ADMIN':

            tasks = Task.objects.all()

        else:

            tasks = Task.objects.filter(
                Q(project__members__user=user) |
                Q(assigned_to=user) |
                Q(project__created_by=user)
            ).distinct()

        # -------------------------
        # Project statistics
        # -------------------------

        total_projects = projects.count()

        active_projects = projects.filter(
            status='ACTIVE'
        ).count()

        completed_projects = projects.filter(
            status='COMPLETED'
        ).count()

        planning_projects = projects.filter(
            status='PLANNING'
        ).count()

        on_hold_projects = projects.filter(
            status='ON_HOLD'
        ).count()

        # -------------------------
        # Task statistics
        # -------------------------

        total_tasks = tasks.count()

        todo_tasks = tasks.filter(
            status='TODO'
        ).count()

        in_progress_tasks = tasks.filter(
            status='IN_PROGRESS'
        ).count()

        in_review_tasks = tasks.filter(
            status='IN_REVIEW'
        ).count()

        completed_tasks = tasks.filter(
            status='COMPLETED'
        ).count()

        blocked_tasks = tasks.filter(
            status='BLOCKED'
        ).count()

        # -------------------------
        # Priority statistics
        # -------------------------

        low_priority_tasks = tasks.filter(
            priority='LOW'
        ).count()

        medium_priority_tasks = tasks.filter(
            priority='MEDIUM'
        ).count()

        high_priority_tasks = tasks.filter(
            priority='HIGH'
        ).count()

        urgent_tasks = tasks.filter(
            priority='URGENT'
        ).count()

        return Response({

            'projects': {
                'total': total_projects,
                'active': active_projects,
                'completed': completed_projects,
                'planning': planning_projects,
                'on_hold': on_hold_projects,
            },

            'tasks': {
                'total': total_tasks,
                'todo': todo_tasks,
                'in_progress': in_progress_tasks,
                'in_review': in_review_tasks,
                'completed': completed_tasks,
                'blocked': blocked_tasks,
            },

            'priority': {
                'low': low_priority_tasks,
                'medium': medium_priority_tasks,
                'high': high_priority_tasks,
                'urgent': urgent_tasks,
            }

        })