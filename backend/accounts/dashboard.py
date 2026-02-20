from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import date
from django.db.models import Sum
from students.models import Student
from fees.models import FeeRecord


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        branch = request.user.branch
        today = date.today()

        total_students = Student.objects.filter(branch=branch, is_active=True).count()
        inactive_students = Student.objects.filter(branch=branch, is_active=False).count()

        # Current month fee stats
        current_month_records = FeeRecord.objects.filter(
            student__branch=branch,
            month=today.month,
            year=today.year,
        )
        paid_count = current_month_records.filter(status='paid').count()
        due_count = current_month_records.filter(status='due').count()
        partial_count = current_month_records.filter(status='partial').count()

        # Students without any record this month = also "due"
        students_with_records = current_month_records.values_list('student_id', flat=True)
        no_record_count = Student.objects.filter(
            branch=branch, is_active=True
        ).exclude(id__in=students_with_records).count()

        total_due = due_count + no_record_count

        # Revenue this month
        revenue_this_month = current_month_records.filter(status='paid').aggregate(
            total=Sum('amount')
        )['total'] or 0

        # Expected revenue
        expected_revenue = Student.objects.filter(
            branch=branch, is_active=True
        ).aggregate(total=Sum('monthly_fee'))['total'] or 0

        # ── Monthly revenue for last 6 months ──
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        monthly_revenue = []
        for i in range(5, -1, -1):
            # Go back i months from current month
            m = today.month - i
            y = today.year
            if m <= 0:
                m += 12
                y -= 1
            rev = FeeRecord.objects.filter(
                student__branch=branch,
                month=m, year=y, status='paid'
            ).aggregate(total=Sum('amount'))['total'] or 0
            monthly_revenue.append({
                'month': month_names[m - 1],
                'revenue': float(rev),
            })

        return Response({
            'total_students': total_students,
            'inactive_students': inactive_students,
            'paid_count': paid_count,
            'due_count': total_due,
            'partial_count': partial_count,
            'revenue_this_month': float(revenue_this_month),
            'expected_revenue': float(expected_revenue),
            'collection_rate': round(paid_count / max(total_students, 1) * 100, 1),
            'pie_data': {
                'paid': paid_count,
                'due': total_due,
                'partial': partial_count,
            },
            'monthly_revenue': monthly_revenue,
        })
