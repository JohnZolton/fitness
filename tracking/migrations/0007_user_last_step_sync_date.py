# Generated by Django 4.1.4 on 2023-01-12 01:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tracking", "0006_alter_metrics_bodyweight"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="last_step_sync_date",
            field=models.DateField(default=None, null=True),
        ),
    ]
