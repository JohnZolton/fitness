from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
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
    res = []
    totals = [0,0,0,0,0]
    print(datetime.date.today()) 
    '''throwaway = Metrics.objects.get(account=request.user, date=datetime.date.today())
    throwaway.delete()'''
    if request.user.id:
        cur_user = User.objects.get(id=request.user.id)
        metrics, _ = Metrics.objects.get_or_create(account=request.user, date=datetime.date.today())
        
        yesterday = datetime.date.today() - datetime.timedelta(days=1)
        print('yesterday: ', yesterday)
        yesterday_metric, created = Metrics.objects.get_or_create(account=request.user, date=yesterday)
        
        if cur_user.auto_copy_previous and not metrics.edited:
            metrics.contents = yesterday_metric.contents
            metrics.save()
            
        if metrics.contents:
            meal_data = eval(metrics.contents)

            for food in meal_data:
                res.append(food)
                for i in range(1, len(food)-1):
                    totals[i-1] += int(food[i])
            
        bodyweight = metrics.bodyweight
        metrics.calories = totals[4]
        metrics.save()
        if cur_user.auto_update_steps and not yesterday_metric.steps:
            email = keys.garmin_email
            password = keys.garmin_pass

            api = Garmin(email, password)
            api.login()
            fields = ['calendarDate','totalSteps']
            format= '%Y-%m-%d'
            total_data = []
            
            yesterdays_data = api.get_stats(yesterday)
            concise_data = []
            for field in fields:
                concise_data.append(yesterdays_data[field])

            metric, _ = Metrics.objects.get_or_create(account=cur_user, date=concise_data[0])
            metric.steps = concise_data[1]

            metric.save()


    else:
        bodyweight = None

    context = {
        'key': api_key,
        'meals': res,
        'protein': totals[0],
        'carbs': totals[1],
        'fats': totals[2],
        'fiber':totals[3],
        'calories': totals[4],
        'bodyweight': bodyweight,
        'date': datetime.date.today()
        }
 
    return render(request, 'tracking/index.html', context)


def addfoods(request):
    item = json.loads(request.body)
    print(item)
    print(request.user)
    user = User.objects.get(id=request.user.id)
    date = item['date']
    newitem = [[item['item'],item['protein'], item['carbs'], item['fat'], item['fiber'],item['cals'], int(item['serving'])]]
    meal, newmeal = Metrics.objects.get_or_create(account=user, date=date)
    
    if newmeal:
        meal.contents = newitem
    else:
        if meal.contents:
            meal.contents = eval(meal.contents) + newitem
        else:
            meal.contents = newitem
    meal.edited = True
    meal.save()
    response = {'response':'nice'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def editfoods(request):
    item = json.loads(request.body)
    newitem = [[item['item'],int(item['protein']), int(item['carbs']), int(item['fat']), int(item['fiber']), int(item['cals']), int(item['serving'])]]
    olditem = [[item['item'],int(item['old_protein']), int(item['old_carbs']), int(item['old_fat']), int(item['old_fiber']),int(item['old_cals']), int(item['old_serving'])]]
    date = item['date']
    user = User.objects.get(id=request.user.id)
    meal = Metrics.objects.get(account=user, date=date)
    content = eval(meal.contents)
    newcontent = []
    for line in content:
        if line == olditem[0]:

            newcontent.append(newitem[0])
        else:
            newcontent.append(line)
    
    meal.contents = newcontent
    meal.edited = True
    meal.save()

    response = {'response':'nice'}
    return HttpResponse(json.dumps(response), content_type='application/json')

def settings(request):
    if request.method=='GET':
        user = User.objects.get(id=request.user.id)

        context = {
            'protein':user.protein_goal,
            'carb': user.carb_goal,
            'fat': user.fat_goal,
            'cals': user.calorie_goal,
            'autostep':user.auto_update_steps,
            'autocopy':user.auto_copy_previous}
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
            'cals': user.calorie_goal,
            'autostep':user.auto_update_steps,
            'autocopy':user.auto_copy_previous}

        return render(request, 'tracking/settings.html', context)

def bodyweight(request):
    if request.method == 'POST':
        dailymetrics = Metrics.objects.get(date=datetime.date.today(), account=request.user)
        dailymetrics.bodyweight = request.POST.get('weight')
        dailymetrics.save()
    return HttpResponseRedirect(reverse('index'))

def steps(request):
    if request.method == 'POST':
        user = User.objects.get(id=request.user.id)
        days = request.POST.get('days')
        email = request.POST.get('email')
        password = request.POST.get('password')
        if request.POST.get('enable'):
            user.auto_update_steps = True
            user.save()
        if request.POST.get('disable'):
            user.auto_update_steps = False
            user.save()

        today = datetime.date.today()

        start_date = today - datetime.timedelta(days=int(days))
        cur_day = today
        #api = Garmin(email, password)
        #api.login()
        fields = ['calendarDate','totalSteps']
        format= '%Y-%m-%d'
        total_data = []
        
        """while cur_day != start_date:
            data = []
            day_data = api.get_stats(cur_day)
            for field in fields:
                data.append(day_data[field])
            total_data.append(data)
            cur_day -= datetime.timedelta(days=1)
            time.sleep(1)"""
        total_data = [
            ['2023-01-12', 9999],
            ['2023-01-11', 9998],
            ['2023-01-10', 9997],
            ['2023-01-9', 9996]
        ]
        
        
        #all_metrics = Metrics.objects.filter(account = user)

        for line in total_data:
            metric, _ = Metrics.objects.get_or_create(account=user, date=line[0])
            metric.steps = line[1]
            metric.save()

        return HttpResponseRedirect(reverse('settings'))

def viewdata(request):
    user = User.objects.get(id=request.user.id)
    
    join_date = user.date_joined
    today = datetime.date.today() 
    metrics = Metrics.objects.filter(account=user).filter(date__range=[join_date, today]).order_by('date')
    i = 1
    dates, bodyweight, steps, calories = [],[],[],[]
    
    for day in metrics:
        dates.append(day.date.strftime('%Y-%m-%d'))
        print(day.bodyweight)
        print(day.steps)
        print(day.calories) 
        
        if day.steps:
            steps.append(day.steps)
        else:
            steps.append(0)
        if day.bodyweight:
            bodyweight.append(day.bodyweight)
        else:
            bodyweight.append(0)
        calories.append(day.calories)

    context = {
        'metrics': metrics,
        'steps_data': steps,
        'bodyweight_data': bodyweight,
        'calorie_data': calories,
        'dates':dates,
    }
    return render(request, 'tracking/data.html', context)

def copyprevious(request):
    user = User.objects.get(id=request.user.id)
    today = datetime.date.today()
    print(today) 
    todays_metrics, created = Metrics.objects.get_or_create(account=user, date=today)
    yesterday = today - datetime.timedelta(days=1)
    yesterdays_metrics, created = Metrics.objects.get_or_create(account=user, date=yesterday)
    if yesterdays_metrics and not created:
        todays_metrics.contents = yesterdays_metrics.contents
        todays_metrics.save()
    else:
        print('sadge')
    return HttpResponseRedirect(reverse('index'))

def enablecopyprevious(request):
    user = User.objects.get(id=request.user.id)
    if request.POST.get('enable'):
        user.auto_copy_previous = True
        user.save()

    return HttpResponseRedirect(reverse('settings'))

def disablecopyprevious(request):
    user = User.objects.get(id=request.user.id)
    if request.POST.get('disable'):
        user.auto_copy_previous = False
        user.save()

    return HttpResponseRedirect(reverse('settings'))


def removefood(request):
    item = json.loads(request.body)
    removeditem = [[item['item'],int(item['protein']), int(item['carbs']), int(item['fat']), int(item['fiber']), int(item['cals']), int(item['serving'])]]
    print(item['date'])
    user = User.objects.get(id=request.user.id)
    meal = Metrics.objects.get(account=user, date=item['date'])
    content = eval(meal.contents)

    newcontent = []
    removed = False
    for line in content:
        if line == removeditem[0] and not removed:
            removed = True
        else:
            newcontent.append(line)
    
    meal.contents = newcontent
    meal.edited = True
    #meal.save()

    return HttpResponseRedirect(reverse('index'))


def displayprevious(request):
    item = json.loads(request.body)
    user = User.objects.get(id=request.user.id)
    date = item['date']
    print(date)
    totals = [0, 0, 0, 0, 0]
    meallog, created = Metrics.objects.get_or_create(account=user, date=date)
    response = {'response':'nice'}
    try:
        meal_data = eval(meallog.contents)
        for line in meal_data:
            for i in range(1, len(line)-1):
                totals[i-1] += line[i]
        print(totals)
    except TypeError:
        meal_data = []
    response = {
        'response': meal_data,
        'total_protein': totals[0],
        'total_carb': totals[1],
        'total_fat': totals[2],
        'total_fiber': totals[3],
        'total_calories': totals[4]}


    
    return HttpResponse(json.dumps(response), content_type='application/json')