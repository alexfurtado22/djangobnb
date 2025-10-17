from django.db import migrations
import django.contrib.postgres.search
import django.contrib.postgres.indexes


class Migration(migrations.Migration):
    dependencies = [
        ("property", "0003_add_fulltext_search"),
    ]

    operations = [
        migrations.AddField(
            model_name="property",
            name="search_vector",
            field=django.contrib.postgres.search.SearchVectorField(
                null=True, editable=False
            ),
        ),
        migrations.AddIndex(
            model_name="property",
            index=django.contrib.postgres.indexes.GinIndex(
                fields=["search_vector"],
                name="property_search_idx",
            ),
        ),
    ]
