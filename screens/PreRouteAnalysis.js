import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  FlatList,
  ScrollView, findNodeHandle,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions, Linking } from 'react-native';
import 'react-native-get-random-values';
import * as Location from 'expo-location';


const googleApiKey = 'AIzaSyBT6nc18rrT6YZrEghVzSGYUoXSiI23oIA';
const Nominatim_BASE_URL = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=";



{/* CONGESTION FEATURE - get color*/ }
const getCongestionColor = (level) => {
    switch (level) {
      case 'low':
        return 'green';
      case 'moderate':
        return 'yellow';
      case 'heavy':
        return 'orange';
      case 'severe':
        return 'red';
      default:
        return 'gray';
    }
  };
{/* WEATHER FEATURE - get weather icon*/}
  function mapWeatherCodeToIcon(code) {
    if ([0].includes(code)) return "☀️"; // Clear
    if ([1].includes(code)) return "🌤"; // Mainly clear
    if ([2].includes(code)) return "🌥"; // Partly cloudy
    if ([3].includes(code)) return "☁️"; // Overcast
    if ([45, 48].includes(code)) return "🌫"; // Fog
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧"; // Rain
    if ([71, 73, 75, 85, 86].includes(code)) return "❄️"; // Snow
    if ([95, 96, 99].includes(code)) return "🌩"; // Thunderstorms
    return "❓"; // Unknown
  }

  // toggle this flag to switch between real & mock
const USE_MOCK = false;

/**
 * Inline mock of preRouteAnalysis()
 * (no imports—just define it in your component file)
 */
{/* DEV - mocking*/}
async function preRouteAnalysisMock(origin, destination) {
  // Simulate a slight delay
  await new Promise((res) => setTimeout(res, 200));

  const numPoints = 20;
  const lonStep = (destination[0] - origin[0]) / (numPoints - 1);
  const latStep = (destination[1] - origin[1]) / (numPoints - 1);

  const stepCoordinates = [];
  const congestionLevels = [];
  const maxSpeeds = [];

  const congestionTypes = ['low', 'moderate', 'heavy', 'severe'];
  const congestionCounts = { low: 0, moderate: 0, heavy: 0, severe: 0, unknown: 0 };
  const congestionLocations = [["congestion_value", "latitude", "longitude"]];

  for (let i = 0; i < numPoints; i++) {
    const lon = origin[0] + i * lonStep;
    const lat = origin[1] + i * latStep;
    const coord = [lon, lat];
    stepCoordinates.push(coord);

    // Rotate congestion type every 5 segments
    const congestion = congestionTypes[Math.floor(i / 5) % congestionTypes.length];
    congestionLevels.push(congestion);
    congestionCounts[congestion] += 1;
    congestionLocations.push([congestion, lat, lon]);

    // Simulate maxspeed changes
    const speed = 30 + (i % 4) * 10;
    maxSpeeds.push({ speed }); // mimic the real API shape
  }

  // Build overview summaries
  const summary = {
    max_congestion: Object.keys(congestionCounts).reduce((a, b) =>
      congestionCounts[a] > congestionCounts[b] ? a : b
    ),
    congestion_overview: [],
    max_speed: 0,
    max_speed_overview: [],
  };

  let prevCongestion = congestionLevels[0];
  let prevSpeed = maxSpeeds[0]?.speed * 0.62 || 0;

  summary.congestion_overview.push([prevCongestion, stepCoordinates[0]]);
  summary.max_speed_overview.push([prevSpeed, stepCoordinates[0]]);
  summary.max_speed = prevSpeed;

  for (let i = 1; i < numPoints; i++) {
    const currentCongestion = congestionLevels[i];
    const currentSpeed = maxSpeeds[i]?.speed * 0.62 || 0;

    if (currentCongestion !== prevCongestion) {
      summary.congestion_overview.push([currentCongestion, stepCoordinates[i]]);
      prevCongestion = currentCongestion;
    }

    if (currentSpeed !== prevSpeed) {
      summary.max_speed_overview.push([currentSpeed, stepCoordinates[i]]);
      prevSpeed = currentSpeed;
    }

    if (currentSpeed > summary.max_speed) {
      summary.max_speed = currentSpeed;
    }
  }

  return [
    {
      ...summary,
      congestion: {
        counts: congestionCounts,
        locations: congestionLocations,
      },
      stepCoordinates,
      polyline_coordinates: congestionLevels,
    },
  ];
}

{/* RIDEABILITY */ }
const calculateCurvature = (coordinates) => {
  console.log("Its saying entering curvature")
  let totalCurvature = 0;

  for (let i = 1; i < coordinates.length - 1; i += 100) {
    const p1 = coordinates[i - 1];
    const p2 = coordinates[i];
    const p3 = coordinates[i + 1];

    // Calculate vectors
    const vector1 = { x: p2[0] - p1[0], y: p2[1] - p1[1] };
    const vector2 = { x: p3[0] - p2[0], y: p3[1] - p2[1] };

    // Calculate angle between vectors using dot product formula
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
    const angle = Math.acos(dotProduct / (magnitude1 * magnitude2));

    totalCurvature += angle;
  }
  console.log("getting total curvature", totalCurvature)

  return totalCurvature;
};

{/* RIDEABILITY */}
const getElevation = async (coordinates, mapboxAccessToken) => {
  let elevations = [];
  const baseUrl = "https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/";

  for (let i = 0; i < coordinates.length; i += 100) {
    const [longitude, latitude] = coordinates[i];
    const url = `${baseUrl}${longitude},${latitude}.json?layers=contour&limit=50&access_token=${mapboxAccessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const elevation = data.features[0].properties.ele;
      console.log(elevation)
      elevations.push(elevation);
    } catch (error) {
      console.error("Error fetching elevation data:", error);
    }
  }

  console.log("Elevation:", elevations);


  return elevations;
};

{/* RIDEABILITY */}
const calculateRideability = (curvature, elevationDiff) => {
  const curvatureWeight = 0.6; // Weight curvature slightly more
  const elevationWeight = 0.4; // Elevation has less influence

  // Normalize curvature and elevation difference to a scale of 0 to 10
  const normalizedCurvature = Math.min(curvature / 10, 1) * 10;
  const normalizedElevation = Math.min(elevationDiff / 500, 1) * 10;

  // Final rideability score
  const rideabilityScore = (curvatureWeight * normalizedCurvature) + (elevationWeight * normalizedElevation);
  console.log("this is the rideability score", rideabilityScore)

  return rideabilityScore;
};

const RESOURCE_TYPES = {
  gas: 'gas_station',
  food: 'restaurant',
  coffee: 'cafe',
};

{/* ROADSIDE - main api call*/}
const fetchPlacesAlongRoute = async (stepCoordinates, googleApiKey) => {
  const sampledCoords = stepCoordinates.filter((_, i) => i % 100 === 0); // sample every ~15th point
  const radius = 1000; // meters
  // changing places to map google maps query
  const places = {
    gas: [],
    food: [],
    coffee: [],
  };


  for (const coord of sampledCoords) {
    console.log("Entering log")
    for (const [key, type] of Object.entries(RESOURCE_TYPES)) {
      if (!places[key]) {
        console.warn(`Unexpected key "${key}" in RESOURCE_TYPES`);
        places[key] = []; // Prevent crash
      }
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coord[1]},${coord[0]}&radius=${radius}&type=${type}&key=${googleApiKey}`;

      try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.results && json.results.length > 0) {
          for (const place of json.results) {
            const alreadyAdded = places[key].some(
              (p) => p.place_id === place.place_id
            );
            if (!alreadyAdded) {
              places[key].push({
                place_id: place.place_id,
                name: place.name,
                address: place.vicinity,
                rating: place.rating,
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
                mapsLink: `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat},${place.geometry.location.lng}`,     
              
              });
            }
          }
        } else {
          console.log(`No results found for ${key} at ${coord}`);
        }
      } catch (err) {
        console.error(`Failed to fetch ${key} at ${coord}`, err);
      }
    }
  }
  return places;
};

const categories = {
  gas: 'Gas Stations',
  food: 'Restaurants',
  coffee: 'Coffee Shops',
};

{ /* ROADSIDE */}
function formatRoadsideSummary (data){


  const counts = { gas: 0, food: 0, coffee: 0 };
  const grouped = { gas: [], food: [], coffee: [] };

  const categoryMap = {
  'gas_stations': 'gas ⛽',
  'restaurants': 'food ',
  'coffee_shops': 'coffee ☕'
};

  // Count and group
  console.log("Starting log");
  Object.entries(data).forEach(([cat, items]) => {
  if (counts.hasOwnProperty(cat)) {
    counts[cat] += items.length;
    grouped[cat].push(...items);
  }
});
  console.log("Completed data");
  // Create summary object
  const summary = { ...counts };
  console.log("Created summary");


  // Create detailed object
  const formatItem = (item) => {
    const link = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
    return {
      name: item.name,
      rating: item.rating || null,
      mapsLink: link
    };
  };

  const detailed = {};
  Object.keys(grouped).forEach(cat => {
    detailed[cat] = grouped[cat]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3)
      .map(formatItem);
  });
  
  console.log("what im done doing this in function")
  return {
    summary,
    detailed
  };

};
  
{/* WEATHER - main api call */}
  const getTripWeatherSummary = async (locations) => {
    let averageTemp = 0;
    let averageWind = 0;
    let apiCalls = 0;
    let minTemp = Infinity;
    let maxTemp = -Infinity;
  
    const iconCounts = {
      "☀️": 0, "🌤": 0, "🌥": 0, "☁️": 0, "🌧": 0,
      "🌦": 0, "❄️": 0, "🌨": 0, "🌫": 0, "🌁": 0, "❓": 0,
    };
  
    const snapshots = [];
  
    for (let i = 0; i < locations.length; i += 4) {
      const { latitude, longitude, timestamp } = locations[i];
  
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,windspeed_10m,weathercode&timezone=UTC`;
  
      try {
        const response = await fetch(url);
        const data = await response.json();
  
        const times = data.hourly.time;
        const temps = data.hourly.temperature_2m;
        const winds = data.hourly.windspeed_10m;
        const codes = data.hourly.weathercode;
  
        // Find closest time index
        const targetTime = new Date(timestamp).toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
        const index = times.findIndex(t => t.startsWith(targetTime));
  
        if (index !== -1) {
          const temp = temps[index];
          const wind = winds[index];
          const icon = mapWeatherCodeToIcon(codes[index]);
  
          averageTemp += temp;
          averageWind += wind;
          minTemp = Math.min(minTemp, temp);
          maxTemp = Math.max(maxTemp, temp);
          iconCounts[icon] = (iconCounts[icon] || 0) + 1;
          apiCalls++;
  
          snapshots.push({
            lat: latitude,
            lon: longitude,
            timestamp,
            temp: (temp * 1.8 + 32), // °F
            wind,
            icon
          });
        }
      } catch (error) {
        console.error("Forecast API error:", error);
      }
    }
  
    const popularIcon = Object.entries(iconCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  
    return {
      average_temperature: apiCalls ? (averageTemp / apiCalls) * 1.8 + 32 : 0,
      min_temperature: minTemp !== Infinity ? (minTemp * 1.8 + 32) : null,
      max_temperature: maxTemp !== -Infinity ? (maxTemp * 1.8 + 32) : null,
      average_wind_speed: apiCalls ? averageWind / apiCalls : 0,
      icons: popularIcon,
      snapshots
    };
  };
  

{/* CONGESTION - main api call */}
const preRouteAnalysis = async (origin, destination, mapboxAccessToken) => {

    // this is the the MapBox Call!
  try {
    console.log('Origin:', origin); 
    console.log('Destination:', destination);
    const baseUrl = "https://api.mapbox.com/directions/v5/mapbox/driving-traffic";
    const coordinates = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;

    const params = new URLSearchParams({
      overview: "full",
      steps: "true",
      alternatives: "true",
      annotations: "distance,duration,speed,maxspeed,congestion",
      geometries: "geojson",
      voice_instructions: "true",
      banner_instructions: "true",
      access_token: mapboxAccessToken,
    });

   const response = await fetch(`${baseUrl}/${coordinates}?${params}`);

    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      const text = await response.text(); // debug output
      console.error("Mapbox returned error HTML:", text.slice(0, 100));
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text.slice(0, 100));
      throw new Error("Expected JSON but got HTML or other content.");
    }

    const data = await response.json();

    const allRoutes = data.routes.map((route) => {
      const legData = route.legs[0];
      const annotations = legData.annotation;
      const stepCoordinates = route.geometry.coordinates;

      const congestions = annotations.congestion;
      const maxSpeeds = annotations.maxspeed;
      const polyline_coordinates = legData.annotation.congestion;


      const analysis = {
        instructions: "",
        congestion: {
          counts: { low: 0, moderate: 0, heavy: 0, severe: 0, unknown: 0 },
          locations: [["congestion_value", "latitude", "longitude"]],
        },
        speed: 0,
      };

      const summary = {
        max_congestion: "",
        congestion_overview: [],
        max_speed: 0,
        max_speed_overview: [],
      };

      let prevCongestion = congestions[0];
      summary.congestion_overview.push([congestions[0], stepCoordinates[0]]);

      let prevMaxSpeed = maxSpeeds[0]?.speed ? maxSpeeds[0].speed * 0.62 : 0;

      for (let i = 0; i < congestions.length; i++) {
const rawSpeed = maxSpeeds[i]?.speed;
const currentSpeed = typeof rawSpeed === "number" ? rawSpeed * 0.62 : 0;
        if (prevMaxSpeed !== currentSpeed) {
          summary.max_speed_overview.push([currentSpeed, stepCoordinates[i]]);
          prevMaxSpeed = currentSpeed;
        }

        if (summary.max_speed < currentSpeed) {
          summary.max_speed = currentSpeed;
        }

        if (prevCongestion !== congestions[i]) {
          summary.congestion_overview.push([congestions[i], stepCoordinates[i]]);
          prevCongestion = congestions[i];
        }

        if (analysis.congestion.counts[congestions[i]] !== undefined) {
          analysis.congestion.counts[congestions[i]] += 1;
        } else {
          analysis.congestion.counts.unknown += 1;
        }
      }

      const maxCongestion = Object.keys(analysis.congestion.counts).reduce((a, b) =>
        analysis.congestion.counts[a] > analysis.congestion.counts[b] ? a : b
      );
      summary.max_congestion = `${maxCongestion}`;

      return {
        ...summary,
        congestion: analysis.congestion,
        stepCoordinates,
        polyline_coordinates: congestions,
      };
    });

    return allRoutes;


    
  } catch (error) {
    console.error('Error during preRouteAnalysis:', error);
    throw error;
  }
};

{/* CONGESTION - emojis */}
const getCongestionEmoji = (level) => {
    switch (level) {
      case 'low':
        return '🟢'; // green circle
      case 'moderate':
        return '🟡'; // yellow circle
      case 'heavy':
        return '🟠'; // orange circle
      case 'severe':
        return '🔴'; // red circle
      default:
        return '⚪'; // unknown
    }
  };


{/* MAX SPEED  - bubbles according to NaN and mph */}
  const SpeedBubble = ({ coordinate, speed, unit = 'mph' }) => {
    // Function to determine the bubble color based on speed
    if (speed === null || isNaN(speed) || speed === 0) {
        return null; // No bubble rendered
      }
    
      // Function to determine the bubble color based on speed
      const getBubbleColor = (speed) => {
        if (speed > 60) return '#2ecc71'; // green
        if (speed > 30) return '#f1c40f'; // yellow
        return '#e74c3c'; // red
      };
    const displaySpeed = speed === null ? 'N/A' : `${speed.toFixed(0)} ${unit}`;
    const bubbleColor = getBubbleColor(speed);
  
    return (
      <Marker coordinate={coordinate}>
        <View style={[styles.speedBubble, { backgroundColor: bubbleColor }]}>
          <Text style={styles.speedText}>{displaySpeed}</Text>
        </View>
      </Marker>
    );
  };

  {/* RENDERING */}
   const renderMultiColorPolyline = (geometryCoords, congestionLevels ) => {
    console.log("Entering rendering function");
    console.log("This is geo cords length: ", geometryCoords.length);
  
    if (!geometryCoords || geometryCoords.length < 2 || !congestionLevels) {
      console.log("Can't find anything, returning null");
      return null;
    }
  
    const segments = [];
  
    for (let i = 1; i < geometryCoords.length; i += 1) {
      console.log("Going through rendering loop");
      const prevCoord = geometryCoords[i - 1];
      const currCoord = geometryCoords[i];
      const congestion = congestionLevels[i - 1] || 'unknown';
  
      segments.push(
        <Polyline
          key={`segment-${i}`}
          coordinates={[
            { latitude: prevCoord[1], longitude: prevCoord[0] },
            { latitude: currCoord[1], longitude: currCoord[0] },
          ]}
          strokeColor={getCongestionColor(congestion)}
          strokeWidth={6}
        />
      );
    }
  
    return segments;
  };
  
  
  
  
{/* EXECUTABLE*/}
export default function PreRouteAnalysis() {
  const [latitude, setLatitude ] = useState(null);
  const [longitude, setLongitude ] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null); // this is preRoute
  const [error, setError] = useState(null);
  const [region, setRegion] = useState({
    latitude: 38.5449,  // Default to Davis
    longitude: -121.7405,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [routes, setRoutes] = useState([]);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [weatherSummary, setWeatherSummary] = useState(null); // this is weather
  const [resources, setResources] = useState(null); // this is roadside resources
  const [rideabilityScore, setRideabilityScore] = useState(null);
  const [places, setPlaces] = useState(null); // this is google maps api
  const [showOverview, setShowOverview] = useState(false);
  const [showSpeedBubbles, setShowSpeedBubbles] = useState(false);
  const [showCoffee, setShowCoffee] = useState(false);
  const [showFood, setShowFood] = useState(false);
  const [showGas, setShowGas] = useState(false);
  const [showPolyline, setShowPolyline] = useState(false);
  const [polylines, setPolylines] = useState(null);


  

  const MAPBOX_ACCESS_TOKEN ='pk.eyJ1Ijoic2FpbGkta2Fya2FyZSIsImEiOiJjbTl0OTZtOTIwOGpuMmlwenY5cHM5dDNlIn0.tSQUU1UtswIIfIPe7jBpzg'; // <-- Replace this!
  
  // calls functions
  const handleSubmit = async () => {
    setLoading(true);
    Keyboard.dismiss();
    setError(null);
    setResponse(null);

    try {
      const parsedLat = latitude;
      const parsedLon = longitude;


      if (isNaN(parsedLat) || isNaN(parsedLon)) {
        setError('Please enter valid numbers for latitude and longitude.');
        setLoading(false);
        return;
      }

      console.log('Selected Location:', { parsedLat, parsedLon });

      const origin = userLocation ? [userLocation.lon, userLocation.lat] : [-121.7405, 38.5449];
      const destination = [parsedLon, parsedLat]; // User input
      console.log("THIS IS THE DESTINATION", destination);

      // const result = await preRouteAnalysis(origin, destination, MAPBOX_ACCESS_TOKEN);

      const result = USE_MOCK
    ? await preRouteAnalysisMock(origin, destination)
    : await preRouteAnalysis(origin, destination, MAPBOX_ACCESS_TOKEN);
  
    console.log("entering cleaned routes function")
    const cleanedRoutes = result.map((route) => {
      const cleanedRoute = {
          maxCongestion: route.max_congestion,
          maxSpeed: route.max_speed,
          congestionOverview: route.congestion_overview,
          maxSpeedOverview: route.max_speed_overview,
          stepCoordinates: route.stepCoordinates,
          congestionLevel: route.polyline_coordinates,
      };
      return cleanedRoute;
  });

  // Set the cleaned route response
  setResponse(cleanedRoutes[0]);
  setRoutes(cleanedRoutes);
  setCurrentRouteIndex(0);

  // Set region for the map
  setRegion({
      latitude: parsedLat,
      longitude: parsedLon,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
  });
  
  // polylines for rendering
  const polylines = renderMultiColorPolyline(cleanedRoutes[0].stepCoordinates, cleanedRoutes[0].congestionLevel);
  setPolylines(polylines);

  // Get weather summary for the route (using cleaned coordinates)
  const locations = cleanedRoutes[0].congestionOverview.map(([_, coords]) => ({
      latitude: coords[1],
      longitude: coords[0],
      timestamp: new Date().toISOString(), // Replace with actual if available
  }));

      
      // making weather call
      const weather = await getTripWeatherSummary(locations);
      setWeatherSummary(weather);

      // doing the Google Maps API call 
      console.log("Trying roadside resources")
      const roadsideResources = await fetchPlacesAlongRoute(
        cleanedRoutes[0].stepCoordinates,
        googleApiKey
      );
      console.log("Done with roadside resources", roadsideResources)

      // reformatting roadside resources
      console.log("Reformatting roadside resources")
      const formattedResources = formatRoadsideSummary(roadsideResources);
      setResources(formattedResources);



      // doing the elevation call
      console.log("Trying curvature + rideability")
      const curvature = calculateCurvature(cleanedRoutes[0].stepCoordinates);
      const elevations = await getElevation(cleanedRoutes[0].stepCoordinates, MAPBOX_ACCESS_TOKEN);
      const maxElevation = Math.max(...elevations);
      const minElevation = Math.min(...elevations);
      const elevationDiff = maxElevation - minElevation;

      // Calculate the rideability score
      console.log("sending to curvature");
      const score = calculateRideability(curvature, elevationDiff);
      const rideStats = {
        curvature: curvature,
        maxElevation: maxElevation,
        minElevation: minElevation,
        score: score
    };
      setRideabilityScore(rideStats);
      console.log("this is the rideability score", rideStats.score);




    } catch (err) {
      setError('Location is too far away or is invalid. Please either choose a location with 100 miles or try to change spelling. ');
      console.error('Detailed error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // CONGESTION - develops polyline
 
  // using live location
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);

  const milesToDegrees = (miles) => miles / 69.0; // approx conversion for latitude/longitude
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }
  
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        });
  
        // Optionally center map on user
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
  
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };
  
    fetchLocation();
  }, []);

  // autocomplete searches
  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length < 3) return setResults([]);

    const delta = milesToDegrees(100); // ~100 miles
    const minLon = userLocation.lon - delta;
    const maxLon = userLocation.lon + delta;
    const minLat = userLocation.lat - delta;
    const maxLat = userLocation.lat + delta;

    const viewbox = `${minLon},${minLat},${maxLon},${maxLat}`;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          text
        )}&format=json&addressdetails=1&limit=5&viewbox=${viewbox}&bounded=1`
      );
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
    }

  };

  
  // user input cleaning
  const handleSelect = (item) => {
    console.log('Selected item:', item);
    setQuery(item.display_name);
    setResults([]);
  
    // Ensure numerical parsing
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon); // not "long"
    console.log('Parsed coordinates:', { lat, lon });
  
    setLatitude(lat);
    setLongitude(lon);
  };

  // scrollable buttons
  
  const scrollViewRef = useRef(null);
  const detailsRef = useRef(null);
  const weatherRef = useRef(null);
  const roadRef = useRef(null);
  const rideRef = useRef(null);


  const scrollToDetails = () => {
    if (detailsRef.current && scrollViewRef.current) {
      detailsRef.current.measureLayout(
        scrollViewRef.current.getNativeScrollRef
          ? scrollViewRef.current.getNativeScrollRef() // for expo SDK 49+ or react-native-web
          : scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y, animated: true });
        },
        (error) => {
          console.error('measureLayout error:', error);
        }
      );
    }
  };

  const scrollToWeather = () => {
    if (weatherRef.current && scrollViewRef.current) {
      weatherRef.current.measureLayout(
        scrollViewRef.current.getNativeScrollRef
          ? scrollViewRef.current.getNativeScrollRef() // for expo SDK 49+ or react-native-web
          : scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y, animated: true });
        },
        (error) => {
          console.error('measureLayout error:', error);
        }
      );
    }
  };
  

  const scrollToRoad = () => {
    if (roadRef.current && scrollViewRef.current) {
      roadRef.current.measureLayout(
        scrollViewRef.current.getNativeScrollRef
          ? scrollViewRef.current.getNativeScrollRef() // for expo SDK 49+ or react-native-web
          : scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y, animated: true });
        },
        (error) => {
          console.error('measureLayout error:', error);
        }
      );
    }
  };

  const scrollToRide = () => {
    if (rideRef.current && scrollViewRef.current) {
      rideRef.current.measureLayout(
        scrollViewRef.current.getNativeScrollRef
          ? scrollViewRef.current.getNativeScrollRef() // for expo SDK 49+ or react-native-web
          : scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y, animated: true });
        },
        (error) => {
          console.error('measureLayout error:', error);
        }
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.header}>Pre-Route Analysis</Text>

      <View style={{ zIndex: 100 }}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={handleSearch}
        placeholder="Enter destination..."
      />
      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
            <Text style={styles.itemText}>{item.display_name}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        nestedScrollEnabled={true} // important if inside another scrollview
      />

    </View>
      

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Analyze</Text>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {response && (
        <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.resultBox}>
          {/* Summary Section */}
          <View style={styles.summaryContainer}>
            <Text style={styles.headerTitle}>Summary</Text>

            <TouchableOpacity onPress={scrollToDetails}>
            <View style={styles.resultBox}>
            <Text style={styles.sectionTitle}>Traffic and Road Conditions</Text>
            <Text style={styles.titleText}>
              Average Congestion: {' '}
            <Text style={styles.summaryText}>
              {response.maxCongestion} {getCongestionEmoji(response.maxCongestion)}
            </Text>
            </Text>
            <Text style={styles.titleText}>
              Max Speed Allowed: {' '}
            <Text style={styles.summaryText}> {response?.maxCongestion ? response.maxSpeed.toFixed(2) : 'N/A'} mph</Text>
            </Text>
            </View>
            </TouchableOpacity>

            <View
              style={{
                  height: 1,
                  width: '85%',          // Less than full width
                  backgroundColor: '#ccc',
                  marginVertical: 12,    // Adds spacing above and below
              }}
            />


            <TouchableOpacity onPress={scrollToWeather}>
            <View style={styles.resultBox}>
              <Text style={styles.sectionTitle}>Weather Conditions</Text>
              {weatherSummary ? (
              <>
              <Text style={styles.titleText}>
                Average Temperature: {' '}
              <Text style={styles.summaryText}> {weatherSummary.average_temperature.toFixed(1)}°F</Text>
              </Text>
              <Text style={styles.titleText}>
                Average Windspeed: {' '}
              <Text style={styles.summaryText}> {weatherSummary.average_wind_speed.toFixed(1)} mph</Text>
              </Text>
              <Text style={styles.titleText}>
                Most Common Weather: {' '}
              <Text style={styles.summaryText}> {weatherSummary.icons}</Text>
              </Text>
            </>
            ) : (
            <Text style={styles.summaryText}>Loading weather data...</Text>
            )}
            </View>
            </TouchableOpacity>

            <View
              style={{
                  height: 1,
                  width: '85%',          // Less than full width
                  backgroundColor: '#ccc',
                  marginVertical: 12,    // Adds spacing above and below
              }}
            />

            <TouchableOpacity onPress={scrollToRide}>
           
            <View style={styles.resultBox}>
            <Text style={styles.sectionTitle}>Riding Conditions</Text>
            {rideabilityScore ? (
            <>
            <Text style={styles.titleText}>
              Rideability Score: {' '}
            <Text style={styles.summaryText}>
                {rideabilityScore.curvature?.toFixed?.(2) ?? "N/A"} 🏍️
            </Text>
            </Text>
            </>
          ) : (
            <Text style={styles.summaryText}>Loading riding data...</Text>
            )}

            </View>
            </TouchableOpacity>

            <View
              style={{
                  height: 1,
                  width: '85%',          // Less than full width
                  backgroundColor: '#ccc',
                  marginVertical: 12,    // Adds spacing above and below
              }}
            />


            <TouchableOpacity onPress={scrollToRoad}>
            <View style={styles.resultBox}>
            <Text style={styles.sectionTitle}>Roadside Resources</Text>

            {resources?.summary ? (
              Object.entries(resources.summary).map(([key, count]) => (
              <Text key={key} style={styles.titleText}>
                {key.charAt(0).toUpperCase() + key.slice(1)}: {' '}
                <Text style={styles.summaryText}>
                {count}
                </Text>
              </Text>
            ))
            ) : (
            <Text style={styles.summaryText}>Loading roadside resources...</Text>
            )}
            </View>
            </TouchableOpacity>
  
      
            {/* Stretch is adding scenic view */}

          </View>
          </View>

                <View style={styles.toggleRow}>

        <TouchableOpacity
          style={styles.ovalButton}
          onPress={() => setShowSpeedBubbles(prev => !prev)}
        >
              <Text style={styles.ovalButtonText}>
                      {showSpeedBubbles ? 'Hide Speed' : 'Show Speed'}
              </Text>
          </TouchableOpacity>

        <TouchableOpacity style={styles.ovalButton} onPress={() => setShowPolyline(prev => !prev)}>
    <Text style={styles.ovalButtonText}>{ showPolyline ? 'Hide Polyline' : 'Show Polyline'}</Text>
  </TouchableOpacity>
  </View>

        <View style={styles.toggleRow}>
  <TouchableOpacity style={styles.ovalButton} onPress={() => setShowCoffee(prev => !prev)}>
    <Text style={styles.ovalButtonText}>{showCoffee ? 'Hide ☕' : 'Show ☕'}</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.ovalButton} onPress={() => setShowFood(prev => !prev)}>
    <Text style={styles.ovalButtonText}>{showFood ? 'Hide 🍔' : 'Show 🍔'}</Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.ovalButton} onPress={() => setShowGas(prev => !prev)}>
    <Text style={styles.ovalButtonText}>{showGas ? 'Hide ⛽' : 'Show ⛽'}</Text>
  </TouchableOpacity>
</View>


          <Text style={styles.sectionTitle}>Speed Overview</Text>
        <View style={styles.mapContainer}>
        <MapView key={`map-${currentRouteIndex}`} style={{ flex: 1 }} region={region}  // Use dynamic region
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}  // Optional: allows manual region changes 
        >
            {/* Adding the congestion */}

            {showPolyline && polylines}


         {/* Speed Bubbles */}
         
         { showSpeedBubbles &&
         
         response?.maxSpeedOverview.map(([speed, coords], index) => (
         <SpeedBubble
            key={`speed-bubble-${index}`}
            coordinate={{ latitude: coords[1], longitude: coords[0] }}
            speed={speed}
        />
      
        ))}

  

        </MapView>
        </View>
        
          {/* Congestion Overview Section TODO: change this to be more user friendly */}
          <View ref={detailsRef}
          style={styles.resultBox}>
        <Text style={styles.headerTitle}>Traffic and Road Information</Text>
          <View style={styles.overviewContainer}>
            <Text style={styles.sectionTitle}>Congestion Overview</Text>
            {/* New format for congestion overview */}
            <View style={styles.congestionOverviewList}>
                {Object.entries(response.congestionOverview.reduce((acc, [congestion]) => {
                    acc[congestion] = (acc[congestion] || 0) + 1;
                    return acc;
                }, {})).map(([level, count], index) => {
                const total = response.congestionOverview.length || 1;
                const percentage = ((count / total) * 100).toFixed(2);

                 return (
                 <View key={index} style={styles.congestionItem}>
                    <View style={[styles.legendColorBox, { backgroundColor: getCongestionColor(level) }]} />
                    <Text style={styles.congestionText}>
                    {level} {percentage}% 
                    </Text>
                </View>
                );
                })}
            </View>

          </View>
        

        {/*Map Overlap for Speed */}
        
        </View>

        {/* Weather conditions */}
        <View ref={weatherRef} style={styles.resultBox}>
            <Text style={styles.headerTitle}>Weather Information</Text>
        
      
  
      {weatherSummary && (
  <>
    {/* Temperature Chart */}
    <Text style={styles.chart}>Temperature Overview</Text>
    <LineChart
      data={{
        labels: weatherSummary.snapshots.map(() => ""),
        datasets: [
          {
            data: weatherSummary.snapshots.map((snap) => snap.temp),
            color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // red
            strokeWidth: 2,
          },
        ],
        legend: ["Temperature (°F)"],
      }}
      width={Dimensions.get('window').width * 0.8}
      height={220}
      chartConfig={{
        backgroundColor: '#1E1E1E',
        backgroundGradientFrom: '#1E1E1E',
        backgroundGradientTo: '#1E1E1E',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(200, 200, 200, ${opacity})`,
        propsForDots: { r: "4", strokeWidth: "1", stroke: "#ffa726" },
      }}
      bezier
      style={{ marginVertical: 8, borderRadius: 10 }}
    />

    {/* Wind Speed Chart */}
    <Text style={styles.chart}>Wind Speed Overview</Text>
    <LineChart
      data={{
        labels: weatherSummary.snapshots.map(() => ""),
        datasets: [
          {
            data: weatherSummary.snapshots.map((snap) => snap.wind),
            color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // blue
            strokeWidth: 2,
          },
        ],
        legend: ["Wind Speed (mph)"],
      }}
      width={Dimensions.get('window').width * 0.8}
      height={220}
      chartConfig={{
        backgroundColor: '#1E1E1E',
        backgroundGradientFrom: '#1E1E1E',
        backgroundGradientTo: '#1E1E1E',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(200, 200, 200, ${opacity})`,
        propsForDots: { r: "4", strokeWidth: "1", stroke: "#3498db" },
      }}
      bezier
      style={{ marginVertical: 8, borderRadius: 10 }}
    />
  </>
)}

      </View>


      <View ref={rideRef} style={styles.resultBox}>
      <Text style={styles.headerTitle}>Riding Conditions</Text>
       {rideabilityScore &&
       <View style={styles.resultBox}>
            <Text style={styles.titleText}>
              Maximum Elevation: {' '}
            <Text style={styles.summaryText}> {rideabilityScore.maxElevation} </Text>
            </Text>
            <Text style={styles.titleText}>
              Minimum Elevation: {' '}
            <Text style={styles.summaryText}> {rideabilityScore.minElevation} </Text>
            </Text>
            <Text style={styles.titleText}>
               Average Curvature on Route: {' '}
            <Text style={styles.summaryText}>{rideabilityScore.curvature?.toFixed?.(2) ?? "N/A"} </Text>
            </Text>
       </View>
       }
       </View>

       {/* Adding scroallable feature */}
       {/* Raodside Resources conditions */}
       <View ref={roadRef} style={styles.resultBox}>
            <Text style={styles.headerTitle}>Roadside Resources</Text>
            {resources?.detailed ? (
            Object.entries(resources.detailed).map(([category, places]) => (
            <View key={category} style={{ marginBottom: 10 }}>
                <Text style={styles.titleText}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                {places.map((place, index) => (
                <View key={index} style={styles.sectionTitle}>
                    <Text style={styles.summaryText}> {'     '} {place.name}</Text>
                    <Text style={styles.summaryText}> {'     '} Rating: {place.rating ?? 'N/A'}</Text>
                    <Text
                        style={styles.linkText}
                        onPress={() => Linking.openURL(place.mapsLink)}
                    >
                    {'     '} View on Maps
                   </Text>
                </View>
                ))}
           </View>
           ))
          ) : (
            <Text styls={styles.summaryText}>Loading roadside resources...</Text>
         )}
         </View>

        {routes.length > 1 && (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
        <Text style={{ color: '#fff', marginBottom: 10 }}>
            {routes.length - 1} alternate route(s) available
        </Text>
        <TouchableOpacity
            style={styles.button}
            onPress={() => {
                  const nextIndex = (currentRouteIndex + 1) % routes.length;
                  setCurrentRouteIndex(nextIndex);
                  setResponse(routes[nextIndex]);
            }}
        >
          <Text style={styles.buttonText}>Find Another Route</Text>
        </TouchableOpacity>

         </View>
        )}

        {routes.length == 1 && (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
        <Text style={{ color: '#fff', marginBottom: 10 }}>
            {routes.length - 1} alternate route(s) available
        </Text>
         </View>
        )}

        {routes.length == 0 && (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
        <Text style={{ color: '#fff', marginBottom: 10 }}>
            No current routes found. Please try an alternative search.
        </Text>
         </View>
        )}



      </ScrollView>
    )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 15,
  },
  resultBox: {
    backgroundColor: '#1E1E1E',
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    borderRadius: 10,
  },
  titleText: {
    color: '#cccccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 5,
    fontWeight: 'normal',
  },
  linkText: {
    fontSize: 16,
    color: '#1E90FF',
    marginBottom: 5,
    fontWeight: 'normal',
    textDecorationLine: 'underline',
  },
  overviewContainer: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  chart: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#cccccc',

  },
  listText: {
    fontSize: 14,
    color: '#bbbbbb',
    marginBottom: 3,
  },  
  mapContainer: {
    height: 300,  // <-- Explicit height
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',  // (optional: make it look cleaner)
  },  
  map: {
    flex: 1,  // Map itself should fill the parent container
  },
  speedBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20, // Rounded bubble
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // For Android shadow
  },
  speedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  congestionBarContainer: {
    flexDirection: 'row',
    height: 20,
    marginVertical: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  
  congestionSegment: {
    height: '100%',
  },
  
  congestionLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 5,
  },
  
  legendText: {
    color: '#ccc',
    fontSize: 13,
  },
  congestionOverviewList: {
    marginTop: 10,
  },
  congestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  congestionText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    color: '#fff', // White input text
  },
  list: {
  backgroundColor: '#1E1E1E', // Slightly lighter than black for contrast
  // marginHorizontal: 16,
  marginTop: 8,
  borderRadius: 12,
  maxHeight: 240,
  borderWidth: 1,
  borderColor: '#222', // Light border for visibility
  paddingVertical: 4,

  // Shadow (iOS)
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },

  // Elevation (Android)
  elevation: 3,
},

item: {
  paddingVertical: 14,
  paddingHorizontal: 12,
  backgroundColor: '##1E1E1E',
},

itemText: {
  color: '#fff',
  fontSize: 16,
},

separator: {
  height: 1,
  backgroundColor: 'black',
  marginHorizontal: 12,
},

ovalButton: {
    alignSelf: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    marginVertical: 10,
  },
  ovalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },

  
});