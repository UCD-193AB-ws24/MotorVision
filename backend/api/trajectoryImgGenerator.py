
import pandas as pd
import numpy as np
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import os
import scipy.signal
import folium
import csv
from PIL import Image

# these are all the predefined functions

def getOptimalZoom(min_lat, max_lat, min_lon, max_lon):
    """
    Estimate an appropriate zoom level based on the bounding box of lat/lon coordinates.
    """
    lat_diff = max_lat - min_lat
    lon_diff = max_lon - min_lon

    # Basic heuristic: larger differences -> lower zoom (wider view)
    zoom_levels = {
        0.01: 15,  # Very small area (city-level zoom)
        0.05: 14,
        0.1: 13,
        0.5: 11,
        1.0: 10,   # Large city-wide view
        5.0: 7,    # Regional view
        10.0: 6,   # Country-wide
        20.0: 5    # Large country-wide view
    }

    max_diff = max(lat_diff, lon_diff)

    for threshold, zoom in sorted(zoom_levels.items()):
        if max_diff < threshold:
            return zoom

    return 4  # Default to a continent-wide view if very large area

def plotHtmlMapFromDataframe(df, output_html_file):
    # Convert data to a list of tuples (lat, lon)
    latlons = list(df[["Latitude", "Longitude"]].itertuples(index=False, name=None))
    center_lat = df["Latitude"].mean()
    center_lon = df["Longitude"].mean()

    # Compute bounding box
    min_lat, max_lat = df["Latitude"].min(), df["Latitude"].max()
    min_lon, max_lon = df["Longitude"].min(), df["Longitude"].max()

    # Determine optimal zoom level
    zoom_start = getOptimalZoom(min_lat, max_lat, min_lon, max_lon)

    # Create a Folium map
    map_obj = folium.Map(location=[center_lat, center_lon], zoom_start=zoom_start, tiles="OpenStreetMap")

    # Add markers for each point
    for lat, lon in latlons:
        folium.CircleMarker(
            location=[lat, lon],
            radius=2,  # Adjust size for better visualization
            color="red",
            fill=True,
            fill_color="red",
            fill_opacity=0.5
        ).add_to(map_obj)

    # Save map as an HTML file
    map_obj.save(output_html_file)
    print("Map saved as motorcyclist_trajectory_map.html. Open it in a browser.")

def convertHtmlToPng(input_html="<html filename>.html", output_png="<img filename>.png"):
    """
    Converts an HTML file (Folium map) to a PNG image using Selenium and headless Chrome.
    """
    # Convert file path to absolute path
    input_html_path = os.path.abspath(input_html)

    # Ensure the file exists
    if not os.path.exists(input_html_path):
        raise FileNotFoundError(f"File not found: {input_html_path}")

    # Format file path for Selenium
    file_url = f"file://{input_html_path}"

    # Set up headless Chrome
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run without UI
    chrome_options.add_argument("--window-size=1200x900")  # Set window size
    chrome_options.add_argument("--disable-gpu")  # Improve performance
    chrome_options.add_argument("--no-sandbox")  # Fixes issues on some systems

    # Launch browser
    driver = webdriver.Chrome(options=chrome_options)

    # Load HTML file
    driver.get(file_url)

    # Wait for the map to load completely
    time.sleep(3)  # Adjust delay if necessary

    # Capture screenshot
    driver.save_screenshot(output_png)
    driver.quit()

    print(f"Screenshot saved as {output_png}")

def simulate_motorcyclist_trajectory(duration_mins=5, spacing_secs=0.4, start_lat=37.7749, start_lon=-122.4194):
    # Calculate total number of data points
    total_time_secs = duration_mins * 60
    num_points = int(total_time_secs / spacing_secs)
    
    # Generate smooth random acceleration and steering using filtered noise
    time = np.linspace(0, total_time_secs, num_points)
    random_accel = np.random.rand(num_points)  # White noise acceleration
    random_steering = np.random.randn(num_points)  # White noise steering

    # Apply smoothing filter (twice differentiable signal)
    random_accel = scipy.signal.savgol_filter(random_accel, window_length=51, polyorder=3)
    random_steering = scipy.signal.savgol_filter(random_steering, window_length=51, polyorder=3)

    # Initialize trajectory lists
    latitudes = []
    longitudes = []
    timestamps = pd.date_range(start="2024-03-08 00:00:00", periods=num_points, freq=f"{int(spacing_secs*1000)}ms")

    # Vehicle movement parameters
    angle = 0  # Initial movement angle
    speed = 0.000  # Approximate base speed in degrees per step (~10m per step)
    
    lat, lon = start_lat, start_lon
    
    for i in range(num_points):
        # Update speed based on smooth acceleration
        speed += random_accel[i] * 0.000001  # Scale random acceleration impact

        # Update angle based on smooth steering
        angle += random_steering[i] * 3  # Adjust turning impact

        # Compute new movement
        delta_lat = speed * np.cos(np.radians(angle))
        delta_lon = speed * np.sin(np.radians(angle))
        
        lat += delta_lat # would swap this out with the live location instead
        lon += delta_lon # would swap this out with the live location instead
        
        latitudes.append(lat)
        longitudes.append(lon)

    # Create DataFrame
    df = pd.DataFrame({
        "Timestamp": timestamps,
        "Latitude": latitudes,
        "Longitude": longitudes
    })

    return df

# Get the trajectory dataframe 
def image_generator(csv_input, html_output, png_output, sim_duration, spacing):
    csv_file =  os.path.join(os.path.dirname(__file__), csv_input)
    df = pd.read_csv(csv_file)

    
    df = simulate_motorcyclist_trajectory(duration_mins=sim_duration, spacing_secs=spacing)

# Run the html/image generators
    output_html_file = os.path.join(os.path.dirname(__file__), html_output)
    output_png_file =  os.path.join(os.path.dirname(__file__), png_output)

    plotHtmlMapFromDataframe(df, output_html_file)
    convertHtmlToPng(input_html=output_html_file, output_png=output_png_file)

    return output_png_file

# TODO for the live shit
# num_points is how many values we have

# this is if i have the same points or if i only have the start
def image_generator_live_start(csv_input_name, html_output_name, png_output_name, sim_duration, spacing, start_latitude, start_longitude):
   
    # this is where the if st atement should be 

    df = simulate_motorcyclist_trajectory(duration_mins=sim_duration, spacing_secs=spacing, start_lat=start_latitude, start_lon=start_longitude)

    # 1 - create the csv storage
    # Run the html/image generators -> this doesn't change\
    print("This is the name I have chosen for csv input", csv_input_name)

    base_dir = "/home/ubuntu" # possible create a new folder for everytime i make a connection?
    folder_name = f"{csv_input_name}"
    folder_path = os.path.join(base_dir, folder_name)
    os.makedirs(folder_path, exist_ok=True) # creating the directory for this recording

    # adding to a folder
    csv_file = os.path.join(folder_path, csv_input_name)  # Saves in current working directory
    print("This is the total name before I call to_csv", csv_file)
    df.to_csv(csv_file, index=False, encoding="utf-8", mode="w")

    full_path = os.path.abspath(csv_file) 
    print("CSV file saved at:", full_path)

    if not html_output_name.endswith(".html"):
        html_output_name += ".html"
    
    html_file = os.path.join(folder_path, html_output_name)
    # Define basic HTML content
    html_content = """<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Welcome to My Page</h1>
    <p>This is a sample HTML file.</p>
</body>
</html>"""

    # 2 - Create and write to the HTML file
    with open(html_file, "w", encoding="utf-8") as file:
        file.write(html_content)
    
    print(f"HTML file '{html_file}' created successfully.")


    # 3 - create a png file
    if not png_output_name.endswith(".png"):
        png_output_name += ".png"
    
    png_file = os.path.join(folder_path, png_output_name)
    # Create a blank image with the specified color
    img = Image.new("RGB", (500, 500), color=(255, 255, 255))

    # Save the image
    img.save(png_file)

    print(f"Blank PNG file '{png_file}' created successfully.")

    # output_html_file = os.path.join(folder_path, html_output_name)
    # output_png_file =  os.path.join(os.path.dirname(__file__), png_output_name)

    plotHtmlMapFromDataframe(df, html_file)
    convertHtmlToPng(input_html=html_file, output_png=png_file)

    return png_file

# this is if i have all live posts
def image_generator_live_list(csv_input_name, html_output_name, png_output_name, timestamps, latitudes, longitudes):

    # so the df has to be changed, where 
    # df = simulate_motorcyclist_trajectory(duration_mins=sim_duration, spacing_secs=spacing, start_lat=start_latitude, start_lon=start_longitude)

    # creating the dataframe from this 
    df = pd.DataFrame({
        "Timestamp": timestamps,
        "Latitude": latitudes,
        "Longitude": longitudes
    })
    # 1 - create the csv storage
    # Run the html/image generators -> this doesn't change\
    print("This is the name I have chosen for csv input", csv_input_name)

    folder_name = f"{csv_input_name}"
    folder_path = os.path.join(os.getcwd(), folder_name)
    os.makedirs(folder_path, exist_ok=True)

    # adding to a folder
    csv_file = os.path.join(folder_path, csv_input_name)  # Saves in current working directory
    print("This is the total name before I call to_csv", csv_file)
    df.to_csv(csv_file, index=False, encoding="utf-8", mode="w")

    full_path = os.path.abspath(csv_file)
    print("CSV file saved at:", full_path)

    if not html_output_name.endswith(".html"):
        html_output_name += ".html"
    
    html_file = os.path.join(folder_path, html_output_name)
    # Define basic HTML content
    html_content = """<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Welcome to My Page</h1>
    <p>This is a sample HTML file.</p>
</body>
</html>"""

    # 2 - Create and write to the HTML file
    with open(html_file, "w", encoding="utf-8") as file:
        file.write(html_content)
    
    print(f"HTML file '{html_file}' created successfully.")


    # 3 - create a png file
    if not png_output_name.endswith(".png"):
        png_output_name += ".png"
    
    png_file = os.path.join(folder_path, png_output_name)
    # Create a blank image with the specified color
    img = Image.new("RGB", (500, 500), color=(255, 255, 255))

    # Save the image
    img.save(png_file)

    print(f"Blank PNG file '{png_file}' created successfully.")

    output_html_file = os.path.join(os.path.dirname(__file__), html_output_name)
    output_png_file =  os.path.join(os.path.dirname(__file__), png_output_name)

    plotHtmlMapFromDataframe(df, output_html_file)
    convertHtmlToPng(input_html=output_html_file, output_png=output_png_file)

    return output_png_file


"""
# Get the trajectory dataframe
def simulation(csv_input, html_output, png_output, sim_duration, spacing):
    csv_file =  os.path.join(os.path.dirname(__file__), "Motorcyclist_Trajectory.csv")
    df = pd.read_csv(csv_file)
    df = simulate_motorcyclist_trajectory(duration_mins=10, spacing_secs=5)

# Run the html/image generators
    output_html_file = os.path.join(os.path.dirname(__file__), "motorcyclist_trajectory_map.html")
    output_png_file =  os.path.join(os.path.dirname(__file__), "motorcyclist_trajectory_map_screenshot.png")

    plotHtmlMapFromDataframe(df, output_html_file)
    convertHtmlToPng(input_html=output_html_file, output_png=output_png_file)
"""


# print("Running simulation function")
# res = image_generator_live_start("Motorcyclist_Trajectory_2.csv", "motorcyclist_trajectory_map_2.html", "motorcyclist_trajectory_map_screenshot_2.png", 10, 5, 37.7749, -122.4194)
# print("Result from simulation: ", res)