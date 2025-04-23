from rest_framework.response import Response
from rest_framework.decorators import api_view
import base64
import datetime

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
                    print("Original timestamp value", timestamps[i]) 
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

    """"
    Refinements/Tasks:
    - reduce number of api calls: done
        - max number of 500 api calls a day
        - so if someone goes on about 5 rides a day, that means that we have
        - 100 api calls allowed, with about 20 for each ride.
    - add something for rain detection (and a lot more features )
    - build averages to call in the frontend: DONE     
    """
    
    data = request.data  # Extract JSON payload from request body
    print()
    print("Starting weather overview...", data)

    trip_points = data["locations"]
    weather_summaries = [] # intiailizing the weather summary array
    print("this is the locations_array as seen in the backend ", trip_points)

    api_calls = 0
    average_temperature = 0
    average_precipitation = 0
    average_wind_speed = 0
    icon_collections = {"☀️": 0, "🌤": 0, "🌥": 0, "☁️": 0, "🌧": 0, "🌦": 0, "🌧": 0, "❄️": 0, "🌨": 0, "🌫": 0, "🌁": 0}
    
    # value to iterate through 
    step = 0
    p = 0

    # stepping through array rather than 
    for p in range(0, len(trip_points)):

        point = trip_points[p]
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
        print(response.json())

        if response.ok:
            data = response.json()
            interval = data.get("timelines", {}).get("hourly", [])[0]
            values = interval["values"]
            print("getting data from tomorrow...")
            print()

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
            api_calls += 1
            average_temperature += values.get("temperature")
            average_wind_speed += values.get("windSpeed")
            icon_collections[map_weather_code_to_icon(values.get("weatherCode")) ] += 1
        # has the coding/information for each latitude/longitude

        p += step
    # print("this is weather summaries: ", weather_summaries)
    print("Developing the weather overview return...")
    #return_array = []

    if (api_calls > 0):
        average_temperature = (average_temperature/float(api_calls))
        average_wind_speed = (average_wind_speed/float(api_calls))
    else:
        average_temperature = 0
        average_wind_speed = 0
    
    popular_icon = max(icon_collections, key=icon_collections.get)

    # return_array.append([{"average_temperature": average_temperature, 
    #                   "average_wind_speed": average_wind_speed,
    #                    "icons": popular_icon}])
    
    # would remove sendi ngthe weather 
    #return_array.append(weather_summaries)
    return_summary = {"average_temperature": (average_temperature*1.8) + 32, 
                        "average_wind_speed": average_wind_speed,
                        "icons": popular_icon}

    return Response({'return_summary': return_summary})


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

@api_view(['GET'])
def pre_route_analysis(request):

    """"
    Refinements/Tasks for this 
    - can send everything that we have for this 
    - and then in the frontend take teh 

    - return: 
        - "instructions": [instructions]
        - "curvature on the road": 

    TODO: 
    - don't understand what inputs/outputs are 
    
    """

    print("Entering pre_route_analysis....")
    data = request.data
    print(data)

    MAPBOX_ACCESS_TOKEN="pk.eyJ1Ijoic2FpbGkta2Fya2FyZSIsImEiOiJjbTl0OTZtOTIwOGpuMmlwenY5cHM5dDNlIn0.tSQUU1UtswIIfIPe7jBpzg"

    
    # if not in latitude, longtiude format
    # convert to latitude, longitude format
    # Origin and destination: [longitude, latitude]
    origin = (-122.431297, 37.773972)     # San Francisco, CA
    destination = (-121.886328, 37.338208)  # San Jose, CA

    # Construct the API URL
    base_url = "https://api.mapbox.com/directions/v5/mapbox/driving-traffic"
    coordinates = f"{origin[0]},{origin[1]};{destination[0]},{destination[1]}"

    params = {
    "overview": "full",
    "steps": "true",
    "annotations": "distance,duration,speed,maxspeed,congestion",
    "geometries": "geojson",
    "voice_instructions": "true",
    "banner_instructions": "true",
    "access_token": MAPBOX_ACCESS_TOKEN
    }

    # Make the request
    response = requests.get(f"{base_url}/{coordinates}", params=params)

    analysis = {"instructions": "", 
                "congestion": {
                    "counts":
                        {
                            "low": 0,
                            "moderate": 0,
                            "high": 0,
                            "severe": 0,
                            "heavy": 0,
                        },
                    "locations": [
                        ["congestion_value", "latitude", "longitude"]
                    ]
                },
                "speed": 0,
            }
                
    summary = {"max_congestion": "", "congestion_overview": [], "max_speed": 0, "max_speed_overview": []}
    # Parse response
    if response.status_code == 200:
        data = response.json()
        route = data["routes"][0]
        leg_data = route["legs"][0]
        annotations = leg_data["annotation"]
        step_coordinates = route["geometry"]["coordinates"]
        # print(annotations)

        max_speeds = annotations["maxspeed"]
        prev_max_speed = max_speeds[0]["speed"]*0.62

        # get congestion overview - when to expect low, moderate 
        congestions = annotations["congestion"]
        summary["congestion_overview"].append([congestions[0], step_coordinates[0]])
        prev_congestion = congestions[0]
        
        for i in range(0, len(congestions)):

            # max speed analysis
            if max_speeds != "null":
                if (prev_max_speed != max_speeds[i]["speed"]*0.62):
                    summary["max_speed_overview"].append([max_speeds[i]["speed"]*0.62, step_coordinates[i]])
                    prev_max_speed = max_speeds[i]["speed"]*0.62
                summary["max_speed"] = max(summary["max_speed"], max_speeds[i]["speed"]*0.62)

            # congestion analysus
            if prev_congestion != congestions[i]:
                summary["congestion_overview"].append([congestions[i], step_coordinates[i]])
                prev_congestion = congestions[i]
            analysis["congestion"]["counts"][congestions[i]] += 1

        max_congestion = max(analysis["congestion"]["counts"], key=analysis["congestion"]["counts"].get)
        summary["max_congestion"] = "The most common congestion for this route is " + max_congestion

        print("Results of congestion analysis: ", summary["max_congestion"])
        print("Results of congestion overview: ", summary["congestion_overview"])
        print("Results of max_speed analysis: ", summary["max_speed"])
        print("Results of max_speed overview: ", summary["max_speed_overview"])


        # speed overview - what the max speed everywhere is 


        # get max speed overview

        #print(route.keys())
    
        """
        print("🛣️ Route Summary:")
        print(f"- Distance: {route['distance'] / 1000:.2f} km")
        print(f"- Duration: {route['duration'] / 60:.2f} minutes\n")

        print("📍 Step-by-Step Directions:")
        steps = route["legs"][0]["steps"]
        for i, step in enumerate(steps):
            instruction = step["maneuver"]["instruction"]
            dist = step["distance"]
            print(f"{i + 1}. {instruction} ({dist:.0f} m)")
    """
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

    
    return Response({'return_summary': summary })


    # create an api call to mapbox to decide what the return value
