from rest_framework import viewsets, permissions
from .models import Property, Category, Amenity, Booking, Review
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer,
    CategorySerializer,
    AmenitySerializer,
    BookingSerializer,
    ReviewSerializer,
)


# --- Add these two new permission classes ---
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


# --- Update PropertyViewSet ---
class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.filter(is_active=True)
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly,
    ]  # Apply permission

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PropertyDetailSerializer
        return PropertyListSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


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
