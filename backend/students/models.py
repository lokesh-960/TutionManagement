from django.db import models
from accounts.models import Branch


class Student(models.Model):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='students')
    name = models.CharField(max_length=200)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], default='Male')
    profile_photo = models.ImageField(upload_to='students/', null=True, blank=True)
    standard = models.CharField(max_length=50, help_text='Class / Grade')
    parent_name = models.CharField(max_length=200)
    parent_phone = models.CharField(max_length=20)
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2)
    join_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.standard})"
