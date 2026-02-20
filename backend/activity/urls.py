from django.urls import path
from .views import GlobalActivityView, StudentActivityView, ActivityDetailView

urlpatterns = [
    path('', GlobalActivityView.as_view(), name='global-activity'),
    path('student/<int:student_id>/', StudentActivityView.as_view(), name='student-activity'),
    path('<int:pk>/', ActivityDetailView.as_view(), name='activity-detail'),
]
