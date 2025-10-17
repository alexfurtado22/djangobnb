from datetime import date
from django.db.models import F
from django.contrib.postgres.search import SearchQuery, SearchRank
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Property, Category, Amenity, Booking, Review
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyCreateSerializer,  # NEW
    PropertyUpdateSerializer,  # NEW
    CategorySerializer,
    AmenitySerializer,
    BookingSerializer,
    ReviewSerializer,
)
from .pagination import SmallResultsSetPagination


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Only allows the owner of an object to edit it."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class IsAuthorOrReadOnly(permissions.BasePermission):
    """Only allows the author of an object to edit it."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class PropertyViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly,
    ]
    pagination_class = SmallResultsSetPagination

    def get_queryset(self):
        """Optimize queries for list vs detail views."""
        base_qs = Property.objects.filter(is_active=True)

        if self.action == "retrieve":
            # For detail view: load everything in bulk
            return base_qs.select_related(
                "owner", "category"
            ).prefetch_related(  # single FK relations
                "images",  # reverse FK
                "amenities",  # M2M
                "reviews__author",  # reviews + user in one prefetch
                "bookings",  # needed for booked dates
            )

        if self.action == "list":
            # Keep it lighter: list usually doesn’t need deep prefetch
            return base_qs.select_related("owner", "category")

        return base_qs

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "retrieve":
            return PropertyDetailSerializer
        if self.action == "create":
            return PropertyCreateSerializer
        if self.action in ["update", "partial_update"]:
            return PropertyUpdateSerializer
        return PropertyListSerializer

    def perform_create(self, serializer):
        """Set the owner when creating a property."""
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        """Ensure user owns the property before updating."""
        property_instance = self.get_object()
        if property_instance.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "You do not have permission to update this property."
            )
        serializer.save()

    def perform_destroy(self, instance):
        """Delete all related images (main + gallery) before deleting the property."""
        if instance.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "You do not have permission to delete this property."
            )

        # Delete main image
        if instance.main_image:
            instance.main_image.delete(save=False)

        # Delete gallery images
        for img in instance.images.all():
            if img.image:
                img.image.delete(save=False)

        instance.images.all().delete()
        instance.delete()

    # --- Check availability for a property ---
    @action(detail=True, methods=["get"])
    def check_availability(self, request, pk=None):
        property_instance = self.get_object()
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")

        if not start_date_str or not end_date_str:
            return Response(
                {"error": "start_date and end_date are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            start_date = date.fromisoformat(start_date_str)
            end_date = date.fromisoformat(end_date_str)
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        overlapping_bookings = Booking.objects.filter(
            property=property_instance, start_date__lt=end_date, end_date__gt=start_date
        ).exists()

        if overlapping_bookings:
            return Response(
                {"is_available": False, "message": "These dates are not available."}
            )

        return Response({"is_available": True, "message": "Dates are available!"})

    # --- Full-text search for properties ---
    @action(detail=False, methods=["get"])
    def search(self, request):
        query = request.query_params.get("q", None)

        if not query:
            return Response(
                {"error": "Query parameter 'q' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        search_query = SearchQuery(query)
        queryset = (
            Property.objects.annotate(rank=SearchRank(F("search_vector"), search_query))
            .filter(search_vector=search_query, is_active=True)
            .order_by("-rank")[:20]
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# --- No changes to CategoryViewSet or AmenityViewSet ---
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class AmenityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer


# --- No changes to BookingViewSet ---
class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(guest=self.request.user)

    def perform_create(self, serializer):
        serializer.save(guest=self.request.user)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related("author").all()
    serializer_class = ReviewSerializer
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsAuthorOrReadOnly,
    ]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
