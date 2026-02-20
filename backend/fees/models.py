from django.db import models
from students.models import Student


class FeeRecord(models.Model):
    STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('due', 'Due'),
        ('partial', 'Partial'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='fee_records')
    month = models.IntegerField(help_text='1-12')
    year = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='due')
    payment_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'month', 'year')
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.student.name} - {self.month}/{self.year} ({self.status})"
