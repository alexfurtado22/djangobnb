from rest_framework import serializers
from .models import (
    Property,
    Category,
    Amenity,
    PropertyImage,
    Booking,
    Review,
)
from datetime import timedelta


# --- Amenity ---
class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ["id", "name"]


# --- Category ---
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


# --- Property Images ---
class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ["id", "image"]


# --- Reviews ---
class ReviewSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source="author.username")
    rating = serializers.IntegerField(min_value=1, max_value=5)

    class Meta:
        model = Review
        fields = ["id", "rating", "comment", "author", "created_at"]


# --- Property List Serializer ---
class PropertyListSerializer(serializers.ModelSerializer):
    """A serializer for the list view of properties (summary)."""

    owner = serializers.ReadOnlyField(source="owner.username")

    class Meta:
        model = Property
        fields = [
            "id",
            "title",
            "city",
            "country",
            "price_per_night",
            "main_image",
            "owner",
        ]


# --- Property Detail Serializer ---
class PropertyDetailSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.username")
    images = PropertyImageSerializer(many=True, read_only=True)
    amenities = AmenitySerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    # Flat list of booked dates
    booked_dates = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = "__all__"

    def get_booked_dates(self, obj):
        """
        Returns a flat list of all dates that are already booked.
        """
        booked = []
        for booking in obj.bookings.all():
            current = booking.start_date
            while current < booking.end_date:
                booked.append(current.strftime("%Y-%m-%d"))
                current += timedelta(days=1)
        return booked


# --- Booking Serializer ---
class BookingSerializer(serializers.ModelSerializer):
    guest = serializers.ReadOnlyField(source="guest.username")
    property_title = serializers.ReadOnlyField(source="property.title")
    property_id = serializers.PrimaryKeyRelatedField(
        queryset=Property.objects.all(), source="property", write_only=True
    )

    class Meta:
        model = Booking
        fields = [
            "id",
            "property_title",
            "guest",
            "start_date",
            "end_date",
            "total_price",
            "property_id",
        ]

    def validate(self, data):
        """
        Validate that start < end and that the property is not already booked.
        """
        if data["start_date"] >= data["end_date"]:
            raise serializers.ValidationError("End date must be after start date.")

        property_instance = data.get("property")
        start_date = data["start_date"]
        end_date = data["end_date"]

        overlapping_bookings = Booking.objects.filter(
            property=property_instance, start_date__lt=end_date, end_date__gt=start_date
        ).exists()

        if overlapping_bookings:
            raise serializers.ValidationError(
                "This property is already booked for the selected dates."
            )

        return data
