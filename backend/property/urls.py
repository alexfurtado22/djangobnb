from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PropertyViewSet,
    CategoryViewSet,
    AmenityViewSet,
    BookingViewSet,
    ReviewViewSet,
)

# The router automatically generates the URLs for our ViewSets
router = DefaultRouter()
router.register(r"properties", PropertyViewSet, basename="property")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"amenities", AmenityViewSet, basename="amenity")
router.register(r"bookings", BookingViewSet, basename="booking")
router.register(r"reviews", ReviewViewSet, basename="review")

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path("", include(router.urls)),
]
