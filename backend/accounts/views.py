from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import LoginSerializer, SignupSerializer, BranchSerializer
from .models import Branch, OTPReset
from activity.models import ActivityLog
import random
from django.utils import timezone
from datetime import timedelta
from activity.models import ActivityLog


class BranchListView(APIView):
    """Public endpoint to list all branches for selection."""
    permission_classes = [AllowAny]

    def get(self, request):
        branches = Branch.objects.select_related('user').all()
        data = [{'id': b.id, 'name': b.name, 'mobile': b.mobile or b.user.username} for b in branches]
        return Response(data)


class SignupView(APIView):
    """Public endpoint to create a new branch + user."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            branch = serializer.save()
            
            # Auto-login after signup
            user = branch.user
            refresh = RefreshToken.for_user(user)
            
            ActivityLog.objects.create(
                branch=branch,
                action_type='login',
                description=f'New Branch "{branch.name}" created and logged in',
            )

            return Response({
                'message': 'Branch created successfully',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'branch': BranchSerializer(branch).data,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        mobile = serializer.validated_data['mobile']
        password = serializer.validated_data['password']

        # The Django User's `username` field is storing the `mobile` number exclusively
        user = authenticate(username=mobile, password=password)
        
        # Fallback: if mobile differs from user.username for older accounts
        if user is None:
            try:
                branch_by_mobile = Branch.objects.get(mobile=mobile)
                user = authenticate(username=branch_by_mobile.user.username, password=password)
            except Branch.DoesNotExist:
                pass

        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            branch = Branch.objects.get(user=user)
        except Branch.DoesNotExist:
             return Response({'error': 'User is not associated with a branch'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        # Optional: Add custom claims if needed, e.g.
        # refresh['branch_id'] = branch.id

        # Log login
        ActivityLog.objects.create(
            branch=branch,
            action_type='login',
            description=f'Branch "{branch.name}" logged in',
        )

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'branch': BranchSerializer(branch).data,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass

        try:
            branch = request.user.branch
            ActivityLog.objects.create(
                branch=branch,
                action_type='logout',
                description=f'Branch "{branch.name}" logged out',
            )
        except:
             pass
             
        return Response({'message': 'Logged out'}, status=status.HTTP_200_OK)


class BranchProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        branch = request.user.branch
        return Response(BranchSerializer(branch).data)

    def patch(self, request):
        branch = request.user.branch
        serializer = BranchSerializer(branch, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class RequestOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        mobile = request.data.get('mobile')
        if not mobile:
            return Response({'error': 'Mobile number is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            branch = Branch.objects.get(mobile=mobile)
        except Branch.DoesNotExist:
            return Response({'error': 'No account found with this mobile number'}, status=status.HTTP_404_NOT_FOUND)

        # Generate a 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Save or update OTP
        OTPReset.objects.filter(mobile=mobile).delete()
        OTPReset.objects.create(mobile=mobile, otp=otp)
        
        # In a real app, send SDK query to SMS provider here.
        print(f"--- FAKE SMS ---")
        print(f"To: {mobile}")
        print(f"Message: Your OTP for password reset is {otp}.")
        print(f"----------------")
        
        return Response({'message': 'OTP sent successfully'})

class VerifyOTPAndResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        mobile = request.data.get('mobile')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        if not all([mobile, otp, new_password]):
             return Response({'error': 'Mobile, OTP, and new password are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp_record = OTPReset.objects.get(mobile=mobile, otp=otp)
        except OTPReset.DoesNotExist:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        # Check expiration (e.g., 10 minutes)
        if otp_record.created_at < timezone.now() - timedelta(minutes=10):
            otp_record.delete()
            return Response({'error': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            branch = Branch.objects.get(mobile=mobile)
            user = branch.user
            user.set_password(new_password)
            user.save()
            
            # Delete OTP record after successful reset
            otp_record.delete()
            
            return Response({'message': 'Password reset successfully'})
        except Branch.DoesNotExist:
            return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)

class DeleteAccountView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        mobile = request.data.get('mobile')
        password = request.data.get('password')

        if not mobile or not password:
            return Response({'error': 'Mobile and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate user to verify identity before deletion
        user = authenticate(username=mobile, password=password)
        
        # Fallback for older accounts
        if user is None:
            try:
                branch = Branch.objects.get(mobile=mobile)
                user = authenticate(username=branch.user.username, password=password)
            except Branch.DoesNotExist:
                pass

        if user is None:
            return Response({'error': 'Invalid credentials. Account deletion failed.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Proceed with deletion
        try:
            branch = Branch.objects.get(user=user)
            branch_name = branch.name
            
            # The User model is cascade-deleted, so deleting the User deletes the Branch.
            # But here `Branch.user` is a OneToOneField with on_delete=models.CASCADE.
            # Wait, `Branch` has `user = models.OneToOneField(User, on_delete=models.CASCADE)`.
            # So deleting the User will delete the Branch.
            user.delete()
            
            return Response({'message': f'Account for branch "{branch_name}" has been permanently deleted.'})
            
        except Branch.DoesNotExist:
            return Response({'error': 'Account not associated with a branch.'}, status=status.HTTP_400_BAD_REQUEST)
