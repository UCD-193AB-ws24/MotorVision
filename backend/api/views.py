from rest_framework.response import Response
from rest_framework.decorators import api_view

# import serial
import threading # import from BluetoothReaderSimulation
from .bluetooth_reader_sim import BluetoothReaderSimulation



@api_view(['GET'])
def printHelloWorld(request):
    name = request.GET.get('name')
    favorite_team = request.GET.get('favorite-team')
    # printedVal = {'message': 'Hello World!'}
    if name:
        printedVal = {'message': f'Hello, {name}, your favorite basketball team is the {favorite_team}!'}

    else:
        printedVal = {'message': 'Hello World!'}
    return Response(printedVal)


@api_view(['GET'])
def printSomething(request):
    name = request.GET.get('name')
    favorite_team = request.GET.get('favorite-team')
    # printedVal = {'message': 'Hello World!'}
    if name:
        printedVal = {'message': f'Hello, {name}, your least favorite basketball team is the {favorite_team}!'}
        print("wer got in name")
    else:
        printedVal = {'message': 'Hello World!'}
    return Response(printedVal)

@api_view(['GET'])
def home_page(request):
    message = "This is the home page!"
    return Response({"message": message})


# beginning of calling from the 
bt_reader_sim = BluetoothReaderSimulation(port="COM5") # swap this out w OS

@api_view(['GET'])
def connect_sim(request):
    res = bt_reader_sim.connect_sim()
    # only takes the boolean value here -> the print outputs are printed as part of module
    if (res == True):
        message = "Connected to Smart Helmet!"
    else:
        message = "Connection not successful. Please try again."
    return Response({"message": message, "res": res})

