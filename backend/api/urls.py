from django.urls import path
from . import views

urlpatterns = [
    path("hello/", views.printHelloWorld),
    path("something/", views.printSomething),
    path("connect/", views.connect),
    path("", views.home_page)
]