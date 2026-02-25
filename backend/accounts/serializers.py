from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Branch


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name', 'mobile', 'language', 'theme', 'fee_due_day']


class LoginSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=15)
    password = serializers.CharField()


class SignupSerializer(serializers.Serializer):
    branch_name = serializers.CharField(max_length=200)
    password = serializers.CharField(write_only=True)
    mobile = serializers.CharField(max_length=15)

    def validate_mobile(self, value):
        if Branch.objects.filter(mobile=value).exists():
            raise serializers.ValidationError("Mobile number already registered")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['mobile'],  # Use mobile as the Django User's 'username'
            password=validated_data['password']
        )
        branch = Branch.objects.create(
            user=user,
            name=validated_data['branch_name'],
            mobile=validated_data['mobile']
        )
        return branch
