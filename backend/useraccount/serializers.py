from rest_framework import serializers
from useraccount.models import Useraccount


class UseraccountSerializer(serializers.ModelSerializer):
    creator_username = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Useraccount
        fields = [
            "id",
            "useraccount_id",
            "name",
            "avatar",
            "creator_username",
            "created_at",
        ]
        read_only_fields = ["creator_username", "created_at"]

    def get_creator_username(self, obj):
        return obj.creator.username if obj.creator else None
