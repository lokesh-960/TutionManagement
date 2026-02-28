from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from activity.models import ActivityLog


class DueNotifyView(APIView):
    """Mock: Send due fee reminders to selected students' parents."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student_ids = request.data.get('student_ids', [])
        message = request.data.get('message', 'Your fee is due. Please pay at the earliest.')

        # Mock notification — no actual SMS/email sent
        sent_count = len(student_ids)

        ActivityLog.objects.create(
            branch=request.user.branch,
            action_type='notification_sent',
            description=f'Due reminders sent to {sent_count} student(s): "{message}"',
        )

        return Response({
            'message': f'Due notification sent to {sent_count} parent(s) (mocked)',
            'sent_to': student_ids,
        })


class CircularView(APIView):
    """Mock: Send circular/announcement to all parents in the branch."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        title = request.data.get('title', '')
        body = request.data.get('body', '')
        target_class = request.data.get('target_class', 'All')

        branch = request.user.branch
        students_query = branch.students.filter(is_active=True)
        
        if target_class and target_class != 'All':
            students_query = students_query.filter(standard=target_class)
            target_desc = f'class {target_class}'
        else:
            target_desc = 'all active students'

        student_count = students_query.count()

        ActivityLog.objects.create(
            branch=branch,
            action_type='notification_sent',
            description=f'Circular "{title}" sent to {student_count} parent(s) in {target_desc}',
        )

        return Response({
            'message': f'Circular sent to {student_count} parent(s) (mocked)',
            'title': title,
            'target': target_class,
        })
