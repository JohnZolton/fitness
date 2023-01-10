from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from .models import *
import requests
import json
import time
import keys

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
    meals = Meal.objects.filter(account=request.user.id)
    context = {
        'key':api_key,
        'meals':meals}
    if request.method == 'GET':
        return render(request, 'tracking/index.html', context)
        
    if request.method == 'POST':
        food = request.POST['food']
        url = f'https://api.nal.usda.gov/fdc/v1/foods/search?api_key={api_key}&query={food}'

        data = requests.get(url).json()
        
        nutrients = {'protein': 0, 'carbs':2, 'fats': 1, 'fiber':9, 'calories':3}

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