from django.db import models
from accounts.models import Branch
from students.models import Student


class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ('student_added', 'Student Added'),
        ('student_updated', 'Student Updated'),
        ('student_deleted', 'Student Deleted'),
        ('fee_paid', 'Fee Paid'),
        ('fee_due', 'Fee Marked Due'),
        ('notification_sent', 'Notification Sent'),
        ('login', 'Login'),
        ('logout', 'Logout'),
    ]

    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='activity_logs')
    action_type = models.CharField(max_length=30, choices=ACTION_CHOICES)
    description = models.TextField()
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True, related_name='activity_logs')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.action_type}] {self.description}"
