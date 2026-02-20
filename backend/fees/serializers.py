from rest_framework import serializers
from .models import FeeRecord


class FeeRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)

    class Meta:
        model = FeeRecord
        fields = [
            'id', 'student', 'student_name', 'month', 'year',
            'amount', 'status', 'payment_date', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
