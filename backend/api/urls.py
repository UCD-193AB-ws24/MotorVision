from django.urls import path
from . import views

urlpatterns = [
    path("hello/", views.printHelloWorld),
    path("something/", views.printSomething),
    path("connect/", views.connect),
    path("traj_image/", views.traj_image),
    path("", views.home_page)
]