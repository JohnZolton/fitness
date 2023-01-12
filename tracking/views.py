from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.core.exceptions import MultipleObjectsReturned
from .models import *
import requests
import json
import datetime
import keys
import time

from garminconnect import (
    Garmin,
    GarminConnectAuthenticationError,
    GarminConnectConnectionError,
    GarminConnectTooManyRequestsError,
)

api_key = keys.api_key


def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "tracking/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "tracking/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "tracking/register.html", {
                "message": "Passwords must match."
            })

        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "tracking/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "tracking/register.html")


def index(request):
    meals = Meal.objects.filter(account=request.user.id, time=datetime.date.today())
    res = []
    totals = [0,0,0,0,0]
    for i in range(len(meals)):
        meal_data = eval(meals[i].contents)
        for food in meal_data:
            res.append(food)
            for i in range(1, len(food)-1):
                totals[i-1] += int(food[i])

    if request.user.id:
        dailymetrics, _ = Metrics.objects.get_or_create(account=request.user, date=datetime.date.today())
        bodyweight = dailymetrics.bodyweight
        steps = dailymetrics.steps
        cur_user = User.objects.get(id=request.user.id)
        if cur_user.last_step_sync_date:
            if datetime.date.today - cur_user.last_step_sync_date == datetime.timedelta(days=1):
                steps_updated = True
        else: 
            steps_updated = False
    else:
        bodyweight = None
        steps = None
        steps_updated = False
    context = {
        'key': api_key,
        'meals': res,
        'protein': totals[0],
        'carbs': totals[1],
        'fats': totals[2],
        'calories': totals[4],
        'bodyweight': bodyweight,
        'steps': steps,
        'steps_updated':steps_updated}
 
    return render(request, 'tracking/index.html', context)


def savemeal(request):
    user = User.objects.get(id=request.user.id)
    count=1
    meal = []
    while request.POST.get(str(count)):
        food_item = request.POST.get(str(count)).split(';')
        meal.append(food_item)
        count+=1
    full_meal = Meal(account=user, contents= meal)
    full_meal.save()
    return HttpResponseRedirect(reverse('index'))

def settings(request):
    if request.method=='GET':
        user = User.objects.get(id=request.user.id)

        context = {
            'protein':user.protein_goal,
            'carb': user.carb_goal,
            'fat': user.fat_goal,
            'cals': user.calorie_goal}
        return render(request, 'tracking/settings.html', context)

    if request.method=='POST':
        user = User.objects.get(id=request.user.id)
        carbs = request.POST.get('carb')
        protein = request.POST.get('protein')
        fats = request.POST.get('fat')
        calories = request.POST.get('true-calories')
        user.carb_goal = carbs
        user.protein_goal = protein
        user.fat_goal = fats
        user.calorie_goal = calories
        user.save()
        context = {
            'protein':user.protein_goal,
            'carb': user.carb_goal,
            'fat': user.fat_goal,
            'cals': user.calorie_goal}

        return render(request, 'tracking/settings.html', context)

def bodyweight(request):
    if request.method == 'POST':
        dailymetrics = Metrics.objects.get(date=datetime.date.today(), account=request.user)
        dailymetrics.bodyweight = request.POST.get('weight')
        dailymetrics.save()
    return HttpResponseRedirect(reverse('index'))

def steps(request):
    if request.method == 'GET':
        user = User.objects.get(id=request.user.id)
        last_date = user.last_step_sync_date
        return render(request, 'tracking/steps.html', {'sync_date': last_date})
    
    if request.method == 'POST':
        days = request.POST.get('days')
        email = request.POST.get('email')
        password = request.POST.get('password')
        print(days, email, password)
        today = datetime.date.today()
        start_date = today - datetime.timedelta(days=int(days))
        cur_day = today
        api = Garmin(email, password)
        api.login()
        fields = ['calendarDate','totalSteps']
        format= '%Y-%m-%d'
        total_data = []
        
        while cur_day != start_date:
            data = []
            day_data = api.get_stats(cur_day)
            for field in fields:
                data.append(day_data[field])
            total_data.append(data)
            cur_day -= datetime.timedelta(days=1)
            time.sleep(.25)
        
        user = User.objects.get(id=request.user.id)

        for line in total_data:
            """try:
                metric, _ = Metrics.objects.get_or_create(account=user, date=line[0])
            except MultipleObjectsReturned as e:
                # handle the case as you need here
                pass"""
            metric, _ = Metrics.objects.get_or_create(account=user, date=line[0])
            metric.steps = line[1]
            metric.save()
            print(metric.steps)
        return HttpResponseRedirect(reverse('steps'))