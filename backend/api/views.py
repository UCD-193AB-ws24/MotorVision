from rest_framework.response import Response
from rest_framework.decorators import api_view
import base64

from django.http import FileResponse
from django.conf import settings
import requests

# import serial
import threading # import from BluetoothReaderSimulation
from .bluetooth_reader_sim import BluetoothReaderSimulation
from .trajectoryImgGenerator import image_generator, image_generator_live_list
from .trajectoryImgGenerator import image_generator_live_start

# TESTING FUNCTION
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

# TESTING FUNCTION
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

# TESTING FUNCTION
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

# DEPRECATED
@api_view(['GET'])
def traj_image(request):
    # TODO: change this to create a new 
    res = image_generator("Motorcyclist_Trajectory.csv", "motorcyclist_trajectory_map.html", "motorcyclist_trajectory_map_screenshot.png", 10, 5)
    with open(res, 'rb') as img_file:
        img_data = base64.b64encode(img_file.read()).decode('utf-8')
    return Response({'image_data': img_data})

# DEPRECATED
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

# DEPRECATED
@api_view(['POST'])
def location_array(request):
    data = request.data  # Extract JSON payload from request body

    print("This is what the backend is seeing", data)
    return Response({"loc_array": "data"})

@api_view(['POST'])
def traj_image_live(request):

    data = request.data  # Extract JSON payload from request body
    print()
    print("Stop button pressed - backend processing for trajectory image...", data)

    locations_array = data["locations"]
    print("this is the locations_array as seen in the backend ", locations_array)
    if len(locations_array) == 0:
        # print("Cannot create mock or real trajectory image. Please try again.")
        # return Response({"message": "Nothing generated because nothing found"})
        print("Creating a completely random map for testing reasons")
        ##csv_name = "Recording_Capture_RANDOM.csv"
        #html_name = "Recording_Capture_RANDOM.html"
        #screenshot_name =  "Recording_Capture_Map_Image_RADNOM.png"
        #res = image_generator_live_start(csv_name, html_name, screenshot_name, 10, 5, 38.51, 24.85)
        ##print("Created mock simulation with starting point.")
        #with open(res, 'rb') as img_file:
        #    img_data = base64.b64encode(img_file.read()).decode('utf-8')
        #return Response({'image_data': img_data})


    latitudes, longitudes, timestamps = [], [], []

    for i in locations_array:
        latitudes.append(i["latitude"])
        longitudes.append(i["longitude"])
        timestamps.append(i["timestamp"])
    
    # duration = timestamps[-1] - timestamps[0] # need to swap this out accordingly


    print("Determining if there is enough data to create a trajectory image...")
    print()

    timestamp = str(timestamps[0]).replace("T", "_Time_").replace(":", "-").replace(".", "_")
    csv_name = "Recording_Capture_" + timestamp + ".csv"
    html_name = "Recording_Capture_Map_HTML_" + timestamp + ".html"
    screenshot_name =  "Recording_Capture_Map_Image_" + timestamp + ".png"

    if len(locations_array) == 1:
        print("Only have starting point. Creating a random simulation...")
        # calling the image generation script
        res = image_generator_live_start(csv_name, html_name, screenshot_name, 10, 5, latitudes[0], longitudes[0])
        print("Created mock simulation with starting point.")
        with open(res, 'rb') as img_file:
            img_data = base64.b64encode(img_file.read()).decode('utf-8')
    else:
        # seeing if there was enough movvement
        if len(locations_array) > 3:
            if (latitudes[0] == latitudes[-1]) and (latitudes[0] == latitudes[len(latitudes)/2]):
                if (longitudes[0] == longitudes[-1]) and (longitudes[0] == longitudes[len(longitudes)/2]):
                    print("Not enough movement or change in trajectory. Creating a random trajectory image...")
                    res = image_generator_live_start(csv_name, html_name, screenshot_name, 10, 5, latitudes[0], longitudes[0])
                    print("Created mock simulation with starting point.")
                    with open(res, 'rb') as img_file:
                        img_data = base64.b64encode(img_file.read()).decode('utf-8')
                    
            else:
                # TODO: determine duration
                # TODO: change list function
                # TODO: change how to call it?
                print("There exists enough data to create a trajectory image. Creating trajectory image...")
                for i in range(0, len(timestamps)):
                    timestamps[i] = str(timestamps[i]).replace("T", "_Time_").replace(":", "-").replace(".", "_")
                res = image_generator_live_list(csv_name, html_name, screenshot_name, timestamps, latitudes, longitudes)
                print("Created real image with real data")
                with open(res, 'rb') as img_file:
                    img_data = base64.b64encode(img_file.read()).decode('utf-8')
                
        else:
            print("Not enough points. Creating a random trajectory image...")
            res = image_generator_live_start(csv_name, html_name, screenshot_name, 10, 5, latitudes[0], longitudes[0])
            print("Created mock simulation with starting point.")
            with open(res, 'rb') as img_file:
                img_data = base64.b64encode(img_file.read()).decode('utf-8')
            

    return Response({'image_data': img_data})
    
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

@api_view(['POST'])
def trip_weather(request):
    
    data = request.data  # Extract JSON payload from request body
    print()
    print("Starting weather overview...", data)

    trip_points = data["locations"]
    weather_summaries = [] # intiailizing the weather summary array
    print("this is the locations_array as seen in the backend ", trip_points)

    for point in trip_points:
        lat = point["latitude"]
        lon = point["longitude"]
        time_iso = point["timestamp"]  # Format: "2025-04-10T15:00:00Z"

        # prepping the api call
        print("Doing an api call")
        url = "https://api.tomorrow.io/v4/weather/history/recent"

        # creating the params to send to ami
        params = {
            "location": f"{lat},{lon}",
            "timesteps": "1h",
            "startTime": time_iso,
            "endTime": time_iso,
            "apikey": settings.TOMORROW_API_KEY
        }

        response = requests.get(url, params=params)
        print("this is the response I have recieved from tomorrow")

        if response.ok:
            data = response.json()
            interval = data.get("timelines", {}).get("hourly", [])[0]
            values = interval["values"]
            print("this is the data", data)

            weather_summaries.append({
                "lat": lat,
                "lon": lon,
                "timestamp": time_iso,
                "summary": {
                    "temp": values.get("temperature"),
                    "precipType": values.get("precipitationType"),
                    "wind": values.get("windSpeed"),
                    "icon": map_weather_code_to_icon(values.get("weatherCode")) 
                }
            })
        print("this is weather summaries: ", weather_summaries)
        return Response({'weather_summary': weather_summaries})


def map_weather_code_to_icon(code):
    # Map weatherCode to emoji or app-specific icon keys
    return {
        1000: "☀️",
        1100: "🌤",
        1101: "🌥",
        1102: "☁️",
        4000: "🌧",
        4200: "🌦",
        4201: "🌧",
        5000: "❄️",
        5100: "🌨",
        6000: "🌫",
        6200: "🌁",
    }.get(code, "❓")

