# Generated by Django 4.1.4 on 2023-02-04 15:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tracking", "0011_user_customernumber"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="subscriptionnumber",
            field=models.CharField(max_length=60, null=True),
        ),
    ]