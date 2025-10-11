from django.contrib import admin
from .models import (
    Property,
    PropertyImage,
    Booking,
    Review,
    Category,
    Amenity,
)


# ------------------------------
# Category & Amenity
# ------------------------------
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


# ------------------------------
# Property Image Inline
# ------------------------------
class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    readonly_fields = ()
    fields = ("image",)


# ------------------------------
# Property Admin
# ------------------------------
@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "owner",
        "city",
        "country",
        "price_per_night",
        "is_active",
        "created_at",
    )
    list_filter = ("city", "country", "is_active", "category")
    search_fields = ("title", "address", "city", "country", "owner__username")
    inlines = [PropertyImageInline]
    filter_horizontal = ("amenities",)
    ordering = ("-created_at",)


# ------------------------------
# Booking Admin
# ------------------------------


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    # 1. 'total_price_display' is replaced with the actual field name 'total_price'
    list_display = (
        "property",
        "guest",
        "start_date",
        "end_date",
        "nights",
        "total_price",
        "created_at",
    )
    list_filter = ("start_date", "end_date")
    search_fields = ("property__title", "guest__username")
    ordering = ("-created_at",)

    # 2. Add this to make the total_price field non-editable in the admin form
    readonly_fields = ("total_price",)

    # Custom column for nights
    def nights(self, obj):
        if obj.start_date and obj.end_date:
            return (obj.end_date - obj.start_date).days
        return 0

    nights.short_description = "Nights"

    # The 'total_price_display' method is no longer needed


# ------------------------------
# Review Admin
# ------------------------------
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("property", "author", "rating", "created_at")
    list_filter = ("rating",)
    search_fields = ("property__title", "author__username")
    ordering = ("-created_at",)
