# Generated by Django 4.1.4 on 2023-01-16 22:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tracking", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="auto_copy_previous",
            field=models.BooleanField(default=False),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="user",
            name="auto_update_steps",
            field=models.BooleanField(default=False),
            preserve_default=False,
        ),
    ]