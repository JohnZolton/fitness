from django.shortcuts import render

# Create your views here.

def index(request):
    if request.method == 'GET':
        return render(request, 'index.html')
        
    if request.method == 'POST':
        print(request.POST['food'])
        return render(request, 'index.html')
