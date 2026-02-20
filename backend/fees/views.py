from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import date
from .models import FeeRecord
from .serializers import FeeRecordSerializer
from students.models import Student
from activity.models import ActivityLog


class FeeRecordListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FeeRecordSerializer

    def get_queryset(self):
        student_id = self.kwargs.get('student_id')
        branch = self.request.user.branch
        return FeeRecord.objects.filter(
            student_id=student_id,
            student__branch=branch,
        )

    def perform_create(self, serializer):
        student_id = self.kwargs.get('student_id')
        student = Student.objects.get(id=student_id, branch=self.request.user.branch)
        fee = serializer.save(student=student)
        ActivityLog.objects.create(
            branch=self.request.user.branch,
            action_type='fee_paid' if fee.status == 'paid' else 'fee_due',
            description=f'Fee {fee.status} for {student.name} ({fee.month}/{fee.year}) - ₹{fee.amount}',
            student=student,
        )


class FeeMarkPaidView(APIView):
    """Mark a specific fee record as paid."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            fee = FeeRecord.objects.get(pk=pk, student__branch=request.user.branch)
        except FeeRecord.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        fee.status = 'paid'
        fee.payment_date = date.today()
        fee.save()

        ActivityLog.objects.create(
            branch=request.user.branch,
            action_type='fee_paid',
            description=f'Fee marked paid for {fee.student.name} ({fee.month}/{fee.year}) - ₹{fee.amount}',
            student=fee.student,
        )
        return Response(FeeRecordSerializer(fee).data)


class FeeMarkDueView(APIView):
    """Mark a specific fee record as due."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            fee = FeeRecord.objects.get(pk=pk, student__branch=request.user.branch)
        except FeeRecord.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        fee.status = 'due'
        fee.payment_date = None
        fee.save()

        ActivityLog.objects.create(
            branch=request.user.branch,
            action_type='fee_due',
            description=f'Fee marked due for {fee.student.name} ({fee.month}/{fee.year}) - ₹{fee.amount}',
            student=fee.student,
        )
        return Response(FeeRecordSerializer(fee).data)
