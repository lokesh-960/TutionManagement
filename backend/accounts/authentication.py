from rest_framework.authentication import BaseAuthentication
from django.contrib.auth.models import User

class BypassAuthentication(BaseAuthentication):
    """
    Custom authentication class that automatically logs in every request 
    using the first user in the database.
    This effectively bypasses authentication for all API endpoints.
    """
    def authenticate(self, request):
        # We need a user with a branch to avoid 500 errors in views
        user = User.objects.filter(branch__isnull=False).first()
        if user:
            return (user, None)
        return None
