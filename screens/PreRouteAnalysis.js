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
import axios from 'axios';

export default function PreRouteAnalysis() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Logging the inputs for testing purposes
      console.log('User Input:', { latitude, longitude });

      // Mock response - this simulates what you would get from your API
      const mockResponse = {
        message: 'Successfully received route analysis',
        latitude,
        longitude,
        result: 'Mock analysis result based on the coordinates',
      };
      setResponse(mockResponse); // This sets the mock response

      // Simulating a delay (like a real API call would take)
      setTimeout(() => {
        setLoading(false); // Turn off loading after a simulated delay
      }, 1500);

    } catch (err) {
      setError('Error occurred while processing your request');
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
        keyboardType="numeric"
        value={latitude}
        onChangeText={setLatitude}
      />
      <TextInput
        style={styles.input}
        placeholder="Longitude"
        placeholderTextColor="#888"
        keyboardType="numeric"
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
  resultDetail: {
    color: '#ccc',
    marginTop: 5,
    fontFamily: 'monospace',
  },
});
