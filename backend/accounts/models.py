from django.db import models
from django.contrib.auth.models import User


class Branch(models.Model):
    """Each Branch maps to a Django User for authentication."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='branch')
    name = models.CharField(max_length=200)
    language = models.CharField(max_length=10, default='en', choices=[
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('ta', 'Tamil'),
    ])
    theme = models.CharField(max_length=10, default='light', choices=[
        ('light', 'Light'),
        ('dark', 'Dark'),
    ])
    fee_due_day = models.IntegerField(default=5, help_text='Day of month when fees become due')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'branches'

    def __str__(self):
        return self.name
