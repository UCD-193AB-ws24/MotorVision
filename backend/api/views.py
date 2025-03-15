from rest_framework.response import Response
from rest_framework.decorators import api_view
import base64

from django.http import FileResponse

# import serial
import threading # import from BluetoothReaderSimulation
from .bluetooth_reader_sim import BluetoothReaderSimulation
from .trajectoryImgGenerator import image_generator


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


# beginning of calling the bluetooth api
# bt_reader_sim = BluetoothReaderSimulation(port="COM5", ".sim13.csv") # swap this out w OS

@api_view(['GET'])
def connect(request):
    # res = bt_reader_sim.connect_sim()
    res = True
    # only takes the boolean value here -> the print outputs are printed as part of module
    if (res == True):
        message = "Connected to Smart Helmet!"
    else:
        message = "Connection not successful. Please try again."
    return Response({"message": message, "res": res})


@api_view(['GET'])
def traj_image(request):
    res = image_generator("Motorcyclist_Trajectory.csv", "motorcyclist_trajectory_map.html", "motorcyclist_trajectory_map_screenshot.png", 10, 5)
    with open(res, 'rb') as img_file:
        img_data = base64.b64encode(img_file.read()).decode('utf-8')
    return Response({'image_data': img_data})

@api_view(['GET'])
def live_loc(request):
    lat = request.GET.get('lat')
    long = request.GET.get('long')
    # printedVal = {'message': 'Hello World!'}
    if lat and long:
        printedVal = {"lat_recieved":lat, "long_recieved": long}

    else:
        printedVal = {'message': 'No data recieved'}
    print("This is what I have ", printedVal)
    return Response(printedVal)

@api_view(['POST'])
def location_array(request):
    data = request.data  # Extract JSON payload from request body

    print("This is what the backend is seeing", data)
    return Response({"loc_array": "data"})
    
@api_view(['POST'])
def crash_prediction(request):
    data = request.data

    arr = data.get("latitude")

    if arr is None:
        return Response({error: "nothing in the array"},  status=status.HTTP_201_CREATED)
    
    print(f"Received location: {arr}")

    """
    - have to figure out a way to read through the array
    """


