import React, { useState, useRef } from 'react';
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
  ScrollView, findNodeHandle,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';



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
// PreRouteAnalysis function (previously done on Django backend)
const preRouteAnalysis = async (origin, destination, mapboxAccessToken) => {

    // this is the the MapBox Call!
  try {
    const baseUrl = "https://api.mapbox.com/directions/v5/mapbox/driving-traffic";
    const coordinates = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;

    const params = new URLSearchParams({
      overview: "full",
      steps: "true",
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

    // processing the results from the MapBox call
    const route = data.routes[0];
    const legData = route.legs[0];
    const annotations = legData.annotation;
    const stepCoordinates = route.geometry.coordinates;

    const congestions = annotations.congestion;
    summary.congestion_overview.push([congestions[0], stepCoordinates[0]]);
    let prevCongestion = congestions[0];

    // updated with new code
    const maxSpeeds = annotations.maxspeed;
    let prevMaxSpeed = maxSpeeds[0]?.speed ? maxSpeeds[0].speed * 0.62 : 0;
    summary.max_speed_overview = [];  // Initialize an empty array for speed overview


    for (let i = 0; i < congestions.length; i++) {
    
        // updated with new code
      const currentSpeed = maxSpeeds[i].speed * 0.62;  // Convert to mph (assuming conversion factor of 0.62)
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
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.773972,  // Default to San Francisco
    longitude: -122.431297,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  

  const MAPBOX_ACCESS_TOKEN ='pk.eyJ1Ijoic2FpbGkta2Fya2FyZSIsImEiOiJjbTl0OTZtOTIwOGpuMmlwenY5cHM5dDNlIn0.tSQUU1UtswIIfIPe7jBpzg'; // <-- Replace this!

  const handleSubmit = async () => {
    setLoading(true);
    Keyboard.dismiss();
    setError(null);
    setResponse(null);

    try {
      console.log('User Input:', { latitude, longitude });

      const parsedLat = parseFloat(latitude);
      const parsedLon = parseFloat(longitude);
      
      if (isNaN(parsedLat) || isNaN(parsedLon)) {
        throw new Error('Please enter valid numbers for latitude and longitude.');
      }

      // TODO: swap this out with live location
       const origin = [-122.431297, 37.773972]; // San Francisco
       const destination = [parsedLon, parsedLat]; // User input

      const result = await preRouteAnalysis(origin, destination, MAPBOX_ACCESS_TOKEN);
      
      setRegion({
        latitude: parsedLat,
        longitude: parsedLon,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      setResponse(result);

    } catch (err) {
      setError('Error occurred while processing your request', err.message);
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


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.header}>Pre-Route Analysis</Text>

      <TextInput
        style={styles.input}
        placeholder="Latitude"
        placeholderTextColor="#888"
        keyboardType="default"
        value={latitude}
        onChangeText={setLatitude}
      />
      <TextInput
        style={styles.input}
        placeholder="Longitude"
        placeholderTextColor="#888"
        keyboardType="default"
        value={longitude}
        onChangeText={setLongitude}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Analyze</Text>
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
            <Text style={styles.summaryText}>Active Construction on Route: </Text>
            </View>
            <View style={styles.resultBox}>
            <Text style={styles.sectionTitle}>Weather Conditions</Text>
            <Text style={styles.summaryText}>Average Temperature: </Text>
            <Text style={styles.summaryText}>Average Precipitation Levels: </Text>
            <Text style={styles.summaryText}>Average Windspeed: </Text>
            </View>
            <View style={styles.resultBox}>
            <Text style={styles.sectionTitle}>Roadside Resources</Text>
            <Text style={styles.summaryText}>Gas Stations Available: </Text>
            <Text style={styles.summaryText}>Fast Food and Coffee Available: </Text>
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
        <MapView style={{ flex: 1 }} region={region}  // Use dynamic region
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}  // Optional: allows manual region changes 
        >
            {/* TODO: make polyline change according to congestion situtation*/}
            {renderMultiColorPolyline()}

         {/* Speed Bubbles */}
         {response.max_speed_overview.map(([speed, coords], index) => (
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
        
        {/* TODO: change this to select different routes */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Find a Different Route</Text>
        </TouchableOpacity>



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
  
});