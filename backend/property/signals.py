# In property/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.postgres.search import SearchVector
from .models import Property


@receiver(post_save, sender=Property)
def update_property_search_vector(sender, instance, **kwargs):
    """
    Automatically updates the search_vector field for a Property instance
    whenever it is saved.
    """
    Property.objects.filter(id=instance.id).update(
        search_vector=(
            # THE CHANGE IS HERE: City and Country are now 'A', Title is 'B'
            SearchVector("title", weight="B")
            + SearchVector("city", weight="A")
            + SearchVector("country", weight="A")
            + SearchVector("address", weight="C")
            + SearchVector("description", weight="D")
        )
    )
