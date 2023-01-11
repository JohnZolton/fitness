# Generated by Django 4.1.4 on 2023-01-11 20:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0002_alter_meal_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='calorie_goal',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='user',
            name='carb_goal',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='user',
            name='fat_goal',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='user',
            name='protein_goal',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
