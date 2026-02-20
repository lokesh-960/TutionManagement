from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import LoginSerializer, SignupSerializer, BranchSerializer
from .models import Branch
from activity.models import ActivityLog


class BranchListView(APIView):
    """Public endpoint to list all branches for selection."""
    permission_classes = [AllowAny]

    def get(self, request):
        branches = Branch.objects.only('id', 'name').all()
        data = [{'id': b.id, 'name': b.name} for b in branches]
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

        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password'],
        )
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
