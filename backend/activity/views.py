from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import ActivityLog
from .serializers import ActivityLogSerializer


class GlobalActivityView(generics.ListAPIView):
    """All activity for the authenticated branch."""
    permission_classes = [IsAuthenticated]
    serializer_class = ActivityLogSerializer

    def get_queryset(self):
        branch = self.request.user.branch
        qs = ActivityLog.objects.filter(branch=branch)

        # Optional filter by action_type
        action_type = self.request.query_params.get('action_type')
        if action_type:
            qs = qs.filter(action_type=action_type)

        return qs[:100]  # limit


class StudentActivityView(generics.ListAPIView):
    """Activity for a specific student."""
    permission_classes = [IsAuthenticated]
    serializer_class = ActivityLogSerializer

    def get_queryset(self):
        student_id = self.kwargs.get('student_id')
        return ActivityLog.objects.filter(
            branch=self.request.user.branch,
            student_id=student_id,
        )[:50]


class ActivityDetailView(generics.DestroyAPIView):
    """Delete a specific activity log."""
    permission_classes = [IsAuthenticated]
    serializer_class = ActivityLogSerializer
    queryset = ActivityLog.objects.all()

    def get_queryset(self):
        # Ensure users can only delete their own branch's logs
        return ActivityLog.objects.filter(branch=self.request.user.branch)
