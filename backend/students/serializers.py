from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'id', 'name', 'gender', 'profile_photo', 'standard', 'parent_name', 'parent_phone',
            'monthly_fee', 'join_date', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StudentListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views."""
    fee_status = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'name', 'gender', 'profile_photo', 'standard', 'parent_phone', 'monthly_fee', 'is_active', 'fee_status']

    def get_fee_status(self, obj):
        from fees.models import FeeRecord
        from datetime import date
        today = date.today()
        record = FeeRecord.objects.filter(
            student=obj, month=today.month, year=today.year
        ).first()
        if record:
            return record.status
        return 'due'
