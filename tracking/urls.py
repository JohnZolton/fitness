from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path('logout', views.logout_view, name='logout'),
    path('register', views.register, name='register'),
    path('settings', views.settings, name='settings'),
    path('bodyweight', views.bodyweight, name='bodyweight'),
    path('steps', views.steps, name='steps'),
    path('viewdata', views.viewdata, name='viewdata'),
    path('addfoods', views.addfoods, name='addfoods'),
    path('editfoods', views.editfoods, name='editfoods'),
    path('copyprevious', views.copyprevious, name='copyprevious'),
    path('enablecopyprevious', views.enablecopyprevious, name='enablecopyprevious'),
    path('disablecopyprevious', views.disablecopyprevious, name='disablecopyprevious'),
    path('removefood', views.removefood, name='removefood'),
    path('displayprevious', views.displayprevious, name='displayprevious'),
    path('copytotoday', views.copytotoday, name='copytotoday'),
]
