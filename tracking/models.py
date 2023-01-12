from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    protein_goal = models.IntegerField()
    carb_goal = models.IntegerField(default=0)
    fat_goal = models.IntegerField(default=0)
    calorie_goal = models.IntegerField(default=0)
    last_step_sync_date = models.DateField(default=None, null=True)

class Meal(models.Model):
    account = models.ForeignKey(User, on_delete=models.CASCADE)
    time = models.DateField(auto_now_add=True)
    contents = models.TextField()

class Metrics(models.Model):
    id = models.AutoField(primary_key=True)
    account = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    steps = models.IntegerField(default=None, null=True)
    bodyweight = models.FloatField(default=None, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['account', 'date'], name='unique_day_metric')
        ]