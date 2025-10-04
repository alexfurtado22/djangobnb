import io

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from PIL import Image


# ------------------------------
# Avatar validation
# ------------------------------
def validate_avatar(image):
    max_size = 2 * 1024 * 1024  # 2 MB
    if image.size > max_size:
        raise ValidationError(
            "The image file is too large. Maximum size allowed is 2 MB."
        )

    try:
        img = Image.open(image)
        if img.format not in ["JPEG", "PNG"]:
            raise ValidationError("Only JPEG and PNG image files are allowed.")
    except IOError:
        raise ValidationError("Invalid image file.")


# ------------------------------
# Custom User model
# ------------------------------
class UserProfile(AbstractUser):
    # Ensure email is unique
    email = models.EmailField(unique=True, verbose_name="Email address")

    # Keep username login for now
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return f"{self.username} ({self.email})"

    @property
    def useraccount_count(self):
        return self.useraccounts.count()

    @property
    def property_count(self):
        return self.properties.count()


# ------------------------------
# Useraccount model
# ------------------------------
class Useraccount(models.Model):
    useraccount_id = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=150, blank=True)
    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        null=True,
        validators=[validate_avatar],
        help_text="Upload a JPEG or PNG image (max 2MB)",
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="useraccounts",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name if self.name else self.useraccount_id
