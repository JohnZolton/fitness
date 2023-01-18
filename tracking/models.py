from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    protein_goal = models.IntegerField(default=0, null=True)
    carb_goal = models.IntegerField(default=0, null=True)
    fat_goal = models.IntegerField(default=0, null=True)
    calorie_goal = models.IntegerField(default=0, null=True)
    last_step_sync_date = models.DateField(default=None, null=True)
    auto_update_steps = models.BooleanField()
    auto_copy_previous = models.BooleanField()
    yesterday_synced = models.BooleanField()

class Metrics(models.Model):
    account = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(null=True)
    steps = models.IntegerField(default=None, null=True)
    bodyweight = models.FloatField(default=None, null=True)
    calories = models.IntegerField(default=0, null=True)
    contents = models.TextField(default=None, null=True)
    edited = models.BooleanField(null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['account', 'date'], name='unique_day_metric')
        ]