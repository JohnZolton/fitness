from django.shortcuts import render
import requests
import json
import time

api_key = ''
def index(request):
    if request.method == 'GET':
        return render(request, 'index.html')
        
    if request.method == 'POST':
        food = request.POST['food']
        url = f'https://api.nal.usda.gov/fdc/v1/foods/search?api_key={api_key}&query={food}'

        data = requests.get(url).json()
        
        nutrients = {'protein': 0, 'carbs':2, 'fats': 1, 'fiber':9, 'calories':3}

        for item in data['foods']:
            print(item['description'])
            """for i in nutrients.values():
                try:
                    print(item['foodNutrients'][i]['nutrientName'], item['foodNutrients'][i]['value'],item['foodNutrients'][i]['unitName'])
                except IndexError:
                    print(':)')"""
        return render(request, 'index.html')
