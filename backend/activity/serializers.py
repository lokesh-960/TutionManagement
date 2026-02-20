from rest_framework import serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True, default=None)

    class Meta:
        model = ActivityLog
        fields = ['id', 'action_type', 'description', 'student', 'student_name', 'timestamp']
        read_only_fields = ['id', 'timestamp']
