from django.shortcuts import render
import requests
import json
import time
import keys

api_key = keys.api_key

def index(request):
    context = {'key':api_key}
    if request.method == 'GET':
        return render(request, 'index.html', context)
        
    if request.method == 'POST':
        food = request.POST['food']
        url = f'https://api.nal.usda.gov/fdc/v1/foods/search?api_key={api_key}&query={food}'

        data = requests.get(url).json()
        
        nutrients = {'protein': 0, 'carbs':2, 'fats': 1, 'fiber':9, 'calories':3}

        return render(request, 'index.html', context)
