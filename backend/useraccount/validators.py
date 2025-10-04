# useraccount/validators.py
from django.core.exceptions import ValidationError
import filetype


def validate_image(image):
    """
    Validate uploaded image file:
    - Max size 2 MB
    - Only JPEG or PNG formats
    """
    max_size = 2 * 1024 * 1024  # 2 MB
    if image.size > max_size:
        raise ValidationError(
            "The image file is too large. Maximum size allowed is 2 MB."
        )

    # Detect file type
    kind = filetype.guess(image)
    if kind is None:
        raise ValidationError("Cannot detect file type. Please upload a valid image.")

    # Allow both JPEG variations
    allowed_mimes = ["image/jpeg", "image/jpg", "image/png"]
    if kind.mime not in allowed_mimes:
        raise ValidationError("Only JPEG and PNG image files are allowed.")
