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


# --- Property Detail Serializer (READ ONLY) ---
class PropertyDetailSerializer(serializers.ModelSerializer):
    """For GET requests - detailed view with nested data."""

    owner = serializers.ReadOnlyField(source="owner.username")
    images = PropertyImageSerializer(many=True, read_only=True)
    amenities = AmenitySerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    booked_dates = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = "__all__"

    def get_booked_dates(self, obj):
        """Returns a flat list of all dates that are already booked."""
        booked = []
        for booking in obj.bookings.all():
            current = booking.start_date
            while current < booking.end_date:
                booked.append(current.strftime("%Y-%m-%d"))
                current += timedelta(days=1)
        return booked


# --- Property Create Serializer ---
# --- Property Create Serializer ---
class PropertyCreateSerializer(serializers.ModelSerializer):
    """For POST requests - creating new properties with gallery images."""

    # Accept list of image files
    gallery_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        allow_empty=True,
    )

    # Accept list of amenity IDs
    amenities = serializers.PrimaryKeyRelatedField(
        queryset=Amenity.objects.all(), many=True, required=False
    )

    # Accept category ID
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=True
    )

    class Meta:
        model = Property
        fields = [
            "title",
            "description",
            "address",
            "city",
            "country",
            "price_per_night",
            "cleaning_fee",
            "service_fee_percent",
            "num_guests",
            "num_bedrooms",
            "num_bathrooms",
            "category",
            "amenities",
            "main_image",
            "gallery_images",  # ✅ FIXED
        ]

    def create(self, validated_data):
        """Create property with gallery images and amenities."""
        gallery_images = validated_data.pop("gallery_images", [])  # ✅ FIXED
        amenities = validated_data.pop("amenities", [])

        # Set the owner from request context
        validated_data["owner"] = self.context["request"].user

        # Create the property
        property_instance = Property.objects.create(**validated_data)

        # Add amenities
        property_instance.amenities.set(amenities)

        # Create gallery images
        for image in gallery_images:
            PropertyImage.objects.create(property=property_instance, image=image)

        return property_instance

    def to_representation(self, instance):
        """Return detailed representation after creation."""
        return PropertyDetailSerializer(instance, context=self.context).data


# --- Property Update Serializer ---
class PropertyUpdateSerializer(serializers.ModelSerializer):
    """For PUT/PATCH requests - updating existing properties."""

    # Optional list of new image files to add
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        allow_empty=True,
    )

    # Optional list of image IDs to delete
    delete_images = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=True,
    )

    amenities = serializers.PrimaryKeyRelatedField(
        queryset=Amenity.objects.all(), many=True, required=False
    )

    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False
    )

    class Meta:
        model = Property
        fields = [
            "title",
            "description",
            "address",
            "city",
            "country",
            "price_per_night",
            "cleaning_fee",
            "service_fee_percent",
            "num_guests",
            "num_bedrooms",
            "num_bathrooms",
            "category",
            "amenities",
            "main_image",
            "images",  # New images to add
            "delete_images",  # Images to remove
        ]

    def update(self, instance, validated_data):
        """Update property with new images and amenities."""
        # Extract special fields
        images_data = validated_data.pop("images", [])
        delete_images = validated_data.pop("delete_images", [])
        amenities = validated_data.pop("amenities", None)

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update amenities if provided
        if amenities is not None:
            instance.amenities.set(amenities)

        # Delete specified images
        if delete_images:
            PropertyImage.objects.filter(
                id__in=delete_images, property=instance
            ).delete()

        # Add new images
        for image in images_data:
            PropertyImage.objects.create(property=instance, image=image)

        return instance

    def validate(self, data):
        """Ensure user owns the property (checked in view as well)."""
        instance = self.instance
        request = self.context.get("request")

        if instance and request and instance.owner != request.user:
            raise serializers.ValidationError(
                "You do not have permission to update this property."
            )

        return data

    def to_representation(self, instance):
        """Return detailed representation after update."""
        return PropertyDetailSerializer(instance, context=self.context).data


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
        """Validate that start < end and that the property is not already booked."""
        if data["start_date"] >= data["end_date"]:
            raise serializers.ValidationError("End date must be after start date.")

        property_instance = data.get("property")
        start_date = data["start_date"]
        end_date = data["end_date"]

        # Exclude current booking if updating
        queryset = Booking.objects.filter(
            property=property_instance, start_date__lt=end_date, end_date__gt=start_date
        )

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "This property is already booked for the selected dates."
            )

        return data
