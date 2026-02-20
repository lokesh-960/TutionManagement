from django.urls import path
from .views import DueNotifyView, CircularView

urlpatterns = [
    path('due/', DueNotifyView.as_view(), name='due-notify'),
    path('circular/', CircularView.as_view(), name='circular'),
]
