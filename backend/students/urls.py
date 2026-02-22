from django.urls import path
from .views import StudentListCreateView, StudentDetailView, StudentToggleFeeView

urlpatterns = [
    path('', StudentListCreateView.as_view(), name='student-list'),
    path('<int:pk>/', StudentDetailView.as_view(), name='student-detail'),
    path('<int:pk>/toggle_current_month_fee/', StudentToggleFeeView.as_view(), name='student-toggle-fee'),
]
