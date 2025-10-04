# useraccount/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import UserProfile, Useraccount


# ------------------------------
# UserProfile Admin (Corrected)
# ------------------------------
@admin.register(UserProfile)
class CustomUserAdmin(UserAdmin):
    """
    Registers the custom UserProfile model, inheriting from the powerful
    UserAdmin class to handle passwords and permissions correctly.
    """

    # The list_display can be customized to show the fields you want
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "date_joined",
    )

    # UserAdmin provides excellent default fieldsets. We will use those
    # instead of defining custom ones to ensure all features work.
    # The 'model' attribute is also handled by the decorator.

    list_filter = ("is_staff", "is_superuser", "is_active", "groups")
    search_fields = ("username", "first_name", "last_name", "email")
    ordering = ("username",)


# ------------------------------
# Useraccount Admin (Already excellent, no changes needed)
# ------------------------------
@admin.register(Useraccount)
class UseraccountAdmin(admin.ModelAdmin):
    """
    Registers the Useraccount model with a custom admin interface,
    including a preview for the avatar.
    """

    list_display = (
        "id",
        "useraccount_id",
        "name",
        "creator",
        "avatar_preview",
        "created_at",
    )
    list_filter = ("creator", "created_at")
    search_fields = ("useraccount_id", "name", "creator__username")
    readonly_fields = ("avatar_preview", "created_at")

    fieldsets = (
        (None, {"fields": ("useraccount_id", "name", "creator")}),
        ("Avatar", {"fields": ("avatar", "avatar_preview")}),
        ("Timestamps", {"fields": ("created_at",)}),
    )

    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit:cover; border-radius:5px;" />',
                obj.avatar.url,
            )
        return "No Image"

    avatar_preview.short_description = "Avatar Preview"
