from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Student
from .serializers import StudentSerializer, StudentListSerializer
from activity.models import ActivityLog


class StudentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'standard', 'parent_name', 'parent_phone']
    ordering_fields = ['name', 'standard', 'join_date', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return StudentListSerializer
        return StudentSerializer

    def get_queryset(self):
        branch = self.request.user.branch
        qs = Student.objects.filter(branch=branch)

        # Filter by status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')

        # Filter by standard
        standard = self.request.query_params.get('standard')
        if standard:
            qs = qs.filter(standard=standard)

        return qs

    def perform_create(self, serializer):
        branch = self.request.user.branch
        student = serializer.save(branch=branch)
        ActivityLog.objects.create(
            branch=branch,
            action_type='student_added',
            description=f'Student "{student.name}" added to {student.standard}',
            student=student,
        )


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StudentSerializer

    def get_queryset(self):
        return Student.objects.filter(branch=self.request.user.branch)

    def perform_update(self, serializer):
        student = serializer.save()
        ActivityLog.objects.create(
            branch=self.request.user.branch,
            action_type='student_updated',
            description=f'Student "{student.name}" details updated',
            student=student,
        )

    def perform_destroy(self, instance):
        name = instance.name
        branch = self.request.user.branch
        instance.delete()
        ActivityLog.objects.create(
            branch=branch,
            action_type='student_deleted',
            description=f'Student "{name}" deleted',
        )
