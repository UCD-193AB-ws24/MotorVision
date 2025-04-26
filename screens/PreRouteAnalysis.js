import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// PreRouteAnalysis function (previously done on Django backend)
const preRouteAnalysis = async (origin, destination, mapboxAccessToken) => {
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

    const route = data.routes[0];
    const legData = route.legs[0];
    const annotations = legData.annotation;
    const stepCoordinates = route.geometry.coordinates;

    const maxSpeeds = annotations.maxspeed;
    let prevMaxSpeed = maxSpeeds[0]?.speed ? maxSpeeds[0].speed * 0.62 : 0;

    const congestions = annotations.congestion;
    summary.congestion_overview.push([congestions[0], stepCoordinates[0]]);
    let prevCongestion = congestions[0];

    for (let i = 0; i < congestions.length; i++) {
      if (maxSpeeds && maxSpeeds[i]?.speed !== null) {
        const currentSpeed = maxSpeeds[i].speed * 0.62;
        if (prevMaxSpeed !== currentSpeed) {
          summary.max_speed_overview.push([currentSpeed, stepCoordinates[i]]);
          prevMaxSpeed = currentSpeed;
        }
        summary.max_speed = Math.max(summary.max_speed, currentSpeed);
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
    summary.max_congestion = `The most common congestion for this route is ${maxCongestion}`;

    return summary;

  } catch (error) {
    console.error('Error during preRouteAnalysis:', error);
    throw error;
  }
};

export default function PreRouteAnalysis() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const MAPBOX_ACCESS_TOKEN ='pk.eyJ1Ijoic2FpbGkta2Fya2FyZSIsImEiOiJjbTl0OTZtOTIwOGpuMmlwenY5cHM5dDNlIn0.tSQUU1UtswIIfIPe7jBpzg'; // <-- Replace this!

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log('User Input:', { latitude, longitude });

      const parsedLat = parseFloat(latitude);
      const parsedLon = parseFloat(longitude);
      
      if (isNaN(parsedLat) || isNaN(parsedLon)) {
        throw new Error('Please enter valid numbers for latitude and longitude.');
      }

       const origin = [-122.431297, 37.773972]; // San Francisco
       const destination = [parsedLon, parsedLat]; // User input

      const result = await preRouteAnalysis(origin, destination, MAPBOX_ACCESS_TOKEN);

      setResponse(result);

    } catch (err) {
      setError('Error occurred while processing your request', err.message);
      console.error('Detailed error:', err);
    } finally {
      setLoading(false);
    }
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
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>Route Analysis:</Text>
          <Text style={styles.resultDetail}>{JSON.stringify(response, null, 2)}</Text>
        </View>
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
});