import React, { useState, useEffect, useRef } from 'react';
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
import { Dimensions } from 'react-native';
import 'react-native-get-random-values';
import * as Location from 'expo-location';


const GOOGLE_API_KEY = 'AIzaSyBT6nc18rrT6YZrEghVzSGYUoXSiI23oIA';
const Nominatim_BASE_URL = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=";




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

  const mapWeatherCodeToIcon = (code) => {
    const iconMap = {
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
    };
    return iconMap[code] || "❓";
  };

  const getTripWeatherSummary = async (locations, apiKey) => {
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
      const point = locations[i];
      const { latitude, longitude, timestamp } = point;
  
      const url = `https://api.tomorrow.io/v4/weather/history/recent?location=${latitude},${longitude}&timesteps=1h&startTime=${timestamp}&endTime=${timestamp}&apikey=${apiKey}`;
  
      try {
        const response = await fetch(url);
        const json = await response.json();
  
        const interval = json?.timelines?.hourly?.[0];
        if (interval) {
          const values = interval.values;
          const temp = values.temperature;
          const wind = values.windSpeed;
          const icon = mapWeatherCodeToIcon(values.weatherCode);
  
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
            temp: (temp * 1.8 + 32), // convert to °F
            wind,
            icon
          });
        }
      } catch (error) {
        console.error(`Weather API call failed for point ${i}:`, error);
      }
    }
  
    const popularIcon = Object.entries(iconCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  
    return {
      average_temperature: apiCalls ? (averageTemp / apiCalls) * 1.8 + 32 : 0,
      min_temperature: minTemp !== Infinity ? (minTemp * 1.8 + 32) : null,
      max_temperature: maxTemp !== -Infinity ? (maxTemp * 1.8 + 32) : null,
      average_wind_speed: apiCalls ? averageWind / apiCalls : 0,
      icons: popularIcon,
      snapshots, // add snapshots array to the return
    };
  };
  
  
// PreRouteAnalysis function (previously done on Django backend)
const preRouteAnalysis = async (origin, destination, mapboxAccessToken) => {

    // this is the the MapBox Call!
  try {
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

    const response = await fetch(`${baseUrl}/${coordinates}?${params}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const allRoutes = data.routes.map((route) => {
      const legData = route.legs[0];
      const annotations = legData.annotation;
      const stepCoordinates = route.geometry.coordinates;

      const congestions = annotations.congestion;
      const maxSpeeds = annotations.maxspeed;

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
        const currentSpeed = maxSpeeds[i].speed * 0.62;
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

      return { ...summary, congestion: analysis.congestion };
    });

    return allRoutes;


    
  } catch (error) {
    console.error('Error during preRouteAnalysis:', error);
    throw error;
  }
};

// Helper function to map congestion levels to emojis
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

  const getSpeedColor = (speed) => {
    if (speed < 30) return 'green';
    if (speed < 60) return 'yellow';
    return 'red';
  };


  // SpeedBubble Component
  const SpeedBubble = ({ coordinate, speed, unit = 'mph' }) => {
    // Function to determine the bubble color based on speed
    if (speed === null || isNaN(speed)) {
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
  
  
  
  

export default function PreRouteAnalysis() {
  const [latitude, setLatitude ] = useState(null);
  const [longitude, setLongitude ] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState({
    latitude: 38.5449,  // Default to Davis
    longitude: -121.7405,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [routes, setRoutes] = useState([]);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [weatherSummary, setWeatherSummary] = useState(null);

  const chartData = weatherSummary ? {
    labels: weatherSummary.snapshots.map((snap, idx) => `${idx}`), // or timestamp slices
    datasets: [
      {
        data: weatherSummary.snapshots.map((snap) => snap.temp),
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // red for temp
        strokeWidth: 2,
      },
      {
        data: weatherSummary.snapshots.map((snap) => snap.wind),
        color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // blue for wind
        strokeWidth: 2,
      },
    ],
    legend: ["Temperature (°F)", "Wind Speed (mph)"],
  } : null;
  

  

  const MAPBOX_ACCESS_TOKEN ='pk.eyJ1Ijoic2FpbGkta2Fya2FyZSIsImEiOiJjbTl0OTZtOTIwOGpuMmlwenY5cHM5dDNlIn0.tSQUU1UtswIIfIPe7jBpzg'; // <-- Replace this!

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



      
      // TODO: swap this out with live location
      const origin = userLocation ? [userLocation.lon, userLocation.lat] : [-121.7405, 38.5449];
      const destination = [parsedLon, parsedLat]; // User input

      const result = await preRouteAnalysis(origin, destination, MAPBOX_ACCESS_TOKEN);

      
      setRegion({
        latitude: parsedLat,
        longitude: parsedLon,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      setRoutes(result);
      setCurrentRouteIndex(0);
      setResponse(result[0]); // show the first route

      const locations = result[0].congestion_overview.map(([_, coords]) => ({
        latitude: coords[1],
        longitude: coords[0],
        timestamp: new Date().toISOString(), // Replace with actual if available
      }));
      
      const weather = await getTripWeatherSummary(locations, 'deccEn38JQr9odvVdVscQfjF2drvKMR5');
      setWeatherSummary(weather);


    } catch (err) {
      setError('Location is too far away or is invalid. Please either choose a location with 100 miles or try to change spelling. ');
      console.error('Detailed error:', err);
    } finally {
      setLoading(false);
    }
  };

  {/* Multi color polyline */}
  const renderMultiColorPolyline = () => {
    const segments = [];
    const points = response?.congestion_overview;
    if (!points || points.length < 2) return null;

    for (let i = 1; i < points.length; i++) {
      const [prevCongestion, prevCoord] = points[i - 1];
      const [, currCoord] = points[i];

      segments.push(
        <Polyline
          key={`segment-${i}`}
          coordinates={[
            { latitude: prevCoord[1], longitude: prevCoord[0] },
            { latitude: currCoord[1], longitude: currCoord[0] },
          ]}
          strokeColor={getCongestionColor(prevCongestion)}
          strokeWidth={6}
        />
      );
    }
    return segments;
  };

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

  

  const handleSelect = (item) => {
    setQuery(item.display_name);
    setResults([]);
  
    // Ensure numerical parsing
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon); // not "long"
  
    setLatitude(lat);
    setLongitude(lon);
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
        style={styles.list}
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
            <Text>{item.display_name}</Text>
          </TouchableOpacity>
        )}
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

      {loading && <ActivityIndicator color="#fff" style={{ marginTop: 20 }} />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {response && (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.resultBox}>
          {/* Summary Section */}
          <View style={styles.summaryContainer}>
            <Text style={styles.headerTitle}>Summary</Text>
            <View style={styles.resultBox}>
            <Text style={styles.sectionTitle}>Traffic and Road Conditions</Text>
            <Text style={styles.summaryText}>
                Average Congestion: {response.max_congestion} {getCongestionEmoji(response.max_congestion)}
            </Text>
            <Text style={styles.summaryText}>Max Speed Allowed: {response.max_speed.toFixed(2)} mph</Text>
            </View>
            <View style={styles.resultBox}>
              <Text style={styles.sectionTitle}>Weather Conditions</Text>
              {weatherSummary ? (
              <>
              <Text style={styles.summaryText}>Average Temperature: {weatherSummary.average_temperature.toFixed(1)}°F</Text>
              <Text style={styles.summaryText}>Average Windspeed: {weatherSummary.average_wind_speed.toFixed(1)} mph</Text>
              <Text style={styles.summaryText}>Most Common Weather: {weatherSummary.icons}</Text>
            </>
            ) : (
            <Text style={styles.summaryText}>Loading weather data...</Text>
            )}
            </View>
            
      
            {/* Stretch is adding scenic view */}

          </View>
          </View>
        
          {/* Congestion Overview Section TODO: change this to be more user friendly */}
          <View style={styles.resultBox}>
        <Text style={styles.headerTitle}>Traffic and Road Information</Text>
          <View style={styles.overviewContainer}>
            <Text style={styles.sectionTitle}>Congestion Overview</Text>
            {/* New format for congestion overview */}
            <View style={styles.congestionOverviewList}>
                {Object.entries(response.congestion_overview.reduce((acc, [congestion]) => {
                    acc[congestion] = (acc[congestion] || 0) + 1;
                    return acc;
                }, {})).map(([level, count], index) => {
                const total = response.congestion_overview.length || 1;
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
        <Text style={styles.sectionTitle}>Speed Overview</Text>
        <View style={styles.mapContainer}>
        <MapView key={`map-${currentRouteIndex}`} style={{ flex: 1 }} region={region}  // Use dynamic region
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}  // Optional: allows manual region changes 
        >
            {/* TODO: make polyline change according to congestion situtation*/}
            {renderMultiColorPolyline()}

         {/* Speed Bubbles */}
         {response?.max_speed_overview.map(([speed, coords], index) => (
         <SpeedBubble
            key={`speed-bubble-${index}`}
            coordinate={{ latitude: coords[1], longitude: coords[0] }}
            speed={speed}
        />
      
        ))}
        </MapView>
        </View>
        </View>

        {/* Weather conditions */}
        <View style={styles.resultBox}>
            <Text style={styles.headerTitle}>Weather Information</Text>

  
      {weatherSummary && (
  <>
    {/* Temperature Chart */}
    <Text style={styles.sectionTitle}>Temperature Overview</Text>
    <LineChart
      data={{
        labels: weatherSummary.snapshots.map((snap, idx) => `${idx}`),
        datasets: [
          {
            data: weatherSummary.snapshots.map((snap) => snap.temp),
            color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // red
            strokeWidth: 2,
          },
        ],
        legend: ["Temperature (°F)"],
      }}
      width={Dimensions.get('window').width - 40}
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
    <Text style={styles.sectionTitle}>Wind Speed Overview</Text>
    <LineChart
      data={{
        labels: weatherSummary.snapshots.map((snap, idx) => `${idx}`),
        datasets: [
          {
            data: weatherSummary.snapshots.map((snap) => snap.wind),
            color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // blue
            strokeWidth: 2,
          },
        ],
        legend: ["Wind Speed (mph)"],
      }}
      width={Dimensions.get('window').width - 40}
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
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
  },
  resultText: {
    color: '#ffffff',
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
  },
  overviewContainer: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
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
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    maxHeight: 240,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
  
    // Subtle shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  
    // Subtle elevation for Android
    elevation: 3,
  }
  
});