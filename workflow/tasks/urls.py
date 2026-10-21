from django.urls import path

from .views import TaskListCreateView, TaskDetailView,TaskCommentListCreateView, TaskAttachmentListCreateView,ActivityLogListView,NotificationListView,NotificationUnreadCountView

urlpatterns = [
    path('', TaskListCreateView.as_view(), name='task-list-create'),
    path('<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path( '<int:task_id>/comments/',TaskCommentListCreateView.as_view(),name='task-comments' ),
    path('<int:task_id>/attachments/', TaskAttachmentListCreateView.as_view(),name='task-attachments'),
    path(  'activities/', ActivityLogListView.as_view(),name='activity-list'),
    path( 'notifications/', NotificationListView.as_view(),name='notification-list'),
    path( 'notifications/', NotificationListView.as_view(),name='notification-list'),
    path( 'notifications/unread-count/', NotificationUnreadCountView.as_view(), name='notification-unread-count'),
]