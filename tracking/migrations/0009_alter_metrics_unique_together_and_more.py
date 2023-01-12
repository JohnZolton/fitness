# Generated by Django 4.1.4 on 2023-01-12 19:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0008_alter_metrics_unique_together'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='metrics',
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name='metrics',
            constraint=models.UniqueConstraint(fields=('account', 'date'), name='unique_day_metric'),
        ),
    ]
