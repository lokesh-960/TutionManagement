import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tuition_project.settings")
django.setup()

from accounts.models import Branch

for b in Branch.objects.all():
    print(f"Branch: {b.name}, Mobile: {b.mobile}, Username: {b.user.username}")

