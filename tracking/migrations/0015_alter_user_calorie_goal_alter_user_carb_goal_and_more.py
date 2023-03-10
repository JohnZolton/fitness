# Generated by Django 4.1.4 on 2023-02-07 13:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tracking", "0014_user_checkout_id"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="calorie_goal",
            field=models.IntegerField(default=2000, null=True),
        ),
        migrations.AlterField(
            model_name="user",
            name="carb_goal",
            field=models.IntegerField(default=232, null=True),
        ),
        migrations.AlterField(
            model_name="user",
            name="fat_goal",
            field=models.IntegerField(default=48, null=True),
        ),
        migrations.AlterField(
            model_name="user",
            name="fiber_goal",
            field=models.IntegerField(default=32, null=True),
        ),
        migrations.AlterField(
            model_name="user",
            name="protein_goal",
            field=models.IntegerField(default=160, null=True),
        ),
    ]
