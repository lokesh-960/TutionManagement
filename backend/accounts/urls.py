from django.urls import path
from .views import LoginView, LogoutView, BranchProfileView, BranchListView, SignupView
from .dashboard import DashboardView

urlpatterns = [
    path('auth/branches/', BranchListView.as_view(), name='branch-list'),
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/profile/', BranchProfileView.as_view(), name='profile'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]
