import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import Branch

Branch.objects.filter(user__username__in=['demo', 'phase2admin']).delete()
print("Deleted dummy branches.")
