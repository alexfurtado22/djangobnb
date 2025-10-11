from datetime import date
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Property, Category, Amenity, Booking, Review
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer,
    CategorySerializer,
    AmenitySerializer,
    BookingSerializer,
    ReviewSerializer,
)


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
    queryset = Property.objects.filter(is_active=True)
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly,
    ]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PropertyDetailSerializer
        return PropertyListSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    # --- ADD THIS ENTIRE METHOD TO YOUR PropertyViewSet ---
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


# --- Update ReviewViewSet ---
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsAuthorOrReadOnly,
    ]  # Apply permission

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
