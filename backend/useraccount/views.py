from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from useraccount.models import Useraccount
from .serializers import UseraccountSerializer
from .pagination import SmallResultsSetPagination
from .filters import UseraccountFilter
from .permissions import IsOwnerOrReadOnly  # 👈 Import your custom permission
import warnings
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie


warnings.filterwarnings("ignore")


class UseraccountViewSet(viewsets.ModelViewSet):
    """
    A secure and feature-rich ViewSet for Useraccount that combines advanced
    filtering, global search, and object-level permissions.
    """

    queryset = Useraccount.objects.all()
    serializer_class = UseraccountSerializer
    pagination_class = SmallResultsSetPagination

    # --- Apply the stronger, object-level permission class ---
    permission_classes = [IsOwnerOrReadOnly]  # 👈 SECURITY FIX

    # --- Full-featured filtering, search, and ordering ---
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = UseraccountFilter
    search_fields = [
        "id",
        "useraccount_id",
        "name",
        "creator__username",
    ]
    ordering_fields = ["created_at", "name", "creator__username"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Optimized queryset to prefetch the creator for performance."""
        user = self.request.user
        base_qs = self.queryset.select_related("creator")

        if not user.is_authenticated:
            return base_qs.none()

        if user.is_staff:
            return base_qs

        return base_qs.filter(creator=user)

    def perform_create(self, serializer):
        """Securely assigns the creator on record creation."""
        serializer.save(creator=self.request.user)


@ensure_csrf_cookie
def get_csrf(request):
    return JsonResponse({"detail": "CSRF cookie set"})
