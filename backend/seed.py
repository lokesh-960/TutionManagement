"""
Seed script: creates a demo branch with students and fee records.
Run with: python manage.py shell < seed.py
"""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import Branch
from students.models import Student
from fees.models import FeeRecord
from datetime import date, timedelta
import random

# ── Create demo branch ──────────────────────────────────────────
username = 'demo'
password = 'demo1234'

if User.objects.filter(username=username).exists():
    print(f'User "{username}" already exists — skipping.')
else:
    user = User.objects.create_user(username=username, password=password)
    branch = Branch.objects.create(user=user, name='Sunrise Tuition Centre')
    print(f'Created branch: {branch.name}  (login: {username} / {password})')

    # ── Students ───────────────────────────────────────────────
    student_data = [
        ('Aarav Sharma', '10th', 'Rajesh Sharma', '9876543210', 2500),
        ('Priya Patel', '9th', 'Amit Patel', '9876543211', 2000),
        ('Rohan Kumar', '10th', 'Suresh Kumar', '9876543212', 2500),
        ('Ananya Singh', '8th', 'Vikram Singh', '9876543213', 1800),
        ('Arjun Gupta', '10th', 'Manoj Gupta', '9876543214', 2500),
        ('Diya Reddy', '9th', 'Ramesh Reddy', '9876543215', 2000),
        ('Kabir Joshi', '8th', 'Sunil Joshi', '9876543216', 1800),
        ('Meera Nair', '10th', 'Anil Nair', '9876543217', 2500),
        ('Sanya Verma', '9th', 'Deepak Verma', '9876543218', 2000),
        ('Vivaan Rao', '8th', 'Kiran Rao', '9876543219', 1800),
    ]

    students = []
    for name, std, parent, phone, fee in student_data:
        join = date.today() - timedelta(days=random.randint(30, 365))
        s = Student.objects.create(
            branch=branch, name=name, standard=std,
            parent_name=parent, parent_phone=phone,
            monthly_fee=fee, join_date=join,
        )
        students.append(s)
    print(f'Created {len(students)} students.')

    # ── Fee records for current + last month ───────────────────
    today = date.today()
    months = [(today.month, today.year)]
    prev_month = today.month - 1
    prev_year = today.year
    if prev_month == 0:
        prev_month = 12
        prev_year -= 1
    months.append((prev_month, prev_year))

    fee_count = 0
    for s in students:
        for m, y in months:
            status = random.choice(['paid', 'paid', 'paid', 'due', 'due'])
            FeeRecord.objects.create(
                student=s, month=m, year=y,
                amount=s.monthly_fee, status=status,
                payment_date=date.today() if status == 'paid' else None,
            )
            fee_count += 1
    print(f'Created {fee_count} fee records.')

print('Seed complete!')
