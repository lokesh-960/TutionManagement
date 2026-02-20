from django.urls import path
from .views import FeeRecordListCreateView, FeeMarkPaidView, FeeMarkDueView

urlpatterns = [
    path('<int:student_id>/', FeeRecordListCreateView.as_view(), name='fee-list'),
    path('mark-paid/<int:pk>/', FeeMarkPaidView.as_view(), name='fee-mark-paid'),
    path('mark-due/<int:pk>/', FeeMarkDueView.as_view(), name='fee-mark-due'),
]
