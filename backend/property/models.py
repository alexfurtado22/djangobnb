from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from PIL import Image


# ------------------------------
# Image validation (your original function)
# ------------------------------
def validate_image(image):
    max_size = 2 * 1024 * 1024  # 2 MB
    if image.size > max_size:
        raise ValidationError("The image file is too large. Maximum size is 2 MB.")

    try:
        img = Image.open(image)
        if img.format not in ["JPEG", "PNG"]:
            raise ValidationError("Only JPEG and PNG image files are allowed.")
    except IOError:
        raise ValidationError("Invalid image file.")


# ------------------------------
# New supporting models
# ------------------------------
class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(
        unique=True, help_text="A URL-friendly name for the category."
    )

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Amenity(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Amenities"

    def __str__(self):
        return self.name


# ------------------------------
# Main Property model (updated)
# ------------------------------
class Property(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="properties", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    num_guests = models.PositiveIntegerField(default=1)
    num_bedrooms = models.PositiveIntegerField(default=1)
    num_bathrooms = models.PositiveIntegerField(default=1)

    # New fields for relationships
    category = models.ForeignKey(
        Category, related_name="properties", on_delete=models.SET_NULL, null=True
    )
    amenities = models.ManyToManyField(Amenity, blank=True)

    main_image = models.ImageField(
        upload_to="property_images/",
        validators=[validate_image],
        help_text="Upload a JPEG or PNG image (max 2MB)",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Properties"

    def __str__(self):
        return f"{self.title} ({self.city}, {self.country})"


# ------------------------------
# Models for gallery, bookings, and reviews
# ------------------------------
class PropertyImage(models.Model):
    property = models.ForeignKey(
        Property, related_name="images", on_delete=models.CASCADE
    )
    image = models.ImageField(
        upload_to="property_images/gallery/", validators=[validate_image]
    )

    def __str__(self):
        return f"Image for {self.property.title}"


class Booking(models.Model):
    property = models.ForeignKey(
        Property, related_name="bookings", on_delete=models.CASCADE
    )
    guest = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="bookings", on_delete=models.CASCADE
    )
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking for {self.property.title} by {self.guest.username}"


class Review(models.Model):
    property = models.ForeignKey(
        Property, related_name="reviews", on_delete=models.CASCADE
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="reviews", on_delete=models.CASCADE
    )
    rating = models.PositiveIntegerField(default=5)  # e.g., 1-5 stars
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (
            "property",
            "author",
        )  # A user can only write one review per property

    def __str__(self):
        return f"Review for {self.property.title} by {self.author.username}"
