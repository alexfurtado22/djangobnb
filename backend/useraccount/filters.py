import django_filters
from useraccount.models import Useraccount  # Or whatever your model is


class UseraccountFilter(django_filters.FilterSet):
    # This filter allows case-insensitive partial matching for the branch.
    # The URL parameter will be ?branch=...
    branch = django_filters.CharFilter(field_name="name", lookup_expr="icontains")

    # This filter maps a 'username' URL parameter to the related creator's username.
    # It also uses case-insensitive partial matching.
    # The URL parameter will be ?username=...
    username = django_filters.CharFilter(
        field_name="creator__username", lookup_expr="icontains"
    )

    class Meta:
        model = Useraccount
        # List all fields you want to filter on.
        # The ones defined above will use the custom behavior.
        # Any other fields listed here would get default (exact match) behavior.
        fields = ["name", "username"]
