from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    protein_goal = models.IntegerField(default=160, null=True)
    carb_goal = models.IntegerField(default=232, null=True)
    fat_goal = models.IntegerField(default=48, null=True)
    calorie_goal = models.IntegerField(default=2000, null=True)
    fiber_goal = models.IntegerField(default=32, null=True)
    last_step_sync_date = models.DateField(default=None, null=True)
    auto_update_steps = models.BooleanField(null=True)
    auto_copy_previous = models.BooleanField(null=True)
    is_subscribed = models.BooleanField(null=True)
    customernumber = models.CharField(max_length= 50, null=True)
    checkout_id = models.CharField(max_length=50, null=True)

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

class Subscription(models.Model):
    name = models.CharField(max_length=100)
    price = models.IntegerField(1000)
    subbed_user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name