from django.urls import path
from . import views

urlpatterns = [
    path("hello/", views.printHelloWorld),
    path("something/", views.printSomething),
    path("connect/", views.connect),
    path("traj_image/", views.traj_image),
    path("live_loc/", views.live_loc),
    path("location_array/", views.location_array),
    path("traj_image_live/", views.traj_image_live),
    path("trip_weather/", views.trip_weather),
    path("pre_route_analysis/", views.pre_route_analysis),
    path("", views.home_page)
]