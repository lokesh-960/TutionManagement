import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import Branch
from django.contrib.auth.models import User

for b in Branch.objects.all():
    print(b.id, b.name, b.user.username)
