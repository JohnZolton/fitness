# Generated by Django 4.1.4 on 2023-02-05 15:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("tracking", "0012_user_subscriptionnumber"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="user",
            name="subscriptionnumber",
        ),
    ]
