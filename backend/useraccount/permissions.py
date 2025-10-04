# permissions.py
from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Allow read-only to everyone, but write/delete only to the object's creator.
    Assumes the model instance has a 'creator' attribute.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions only allowed to creator
        return obj.creator == request.user
