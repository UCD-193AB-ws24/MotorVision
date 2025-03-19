// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  // Mock state to simulate real-time data
  const [speed, setSpeed] = useState(0);
  const [battery, setBattery] = useState(100);
  const [tripDuration, setTripDuration] = useState(0);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed((Math.random() * 60).toFixed(1)); // Simulate random speed
      setBattery((prev) => (prev > 0 ? (prev - 0.1).toFixed(1) : 100)); // Decreasing battery
      setTripDuration((prev) => prev + 1); // Increment trip duration each second
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Convert seconds to HH:MM:SS
  const formatDuration = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const sec = secs % 60;
    return `${hrs}:${mins.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🏍️ MotorVision Dashboard</Text>

      <View style={styles.statContainer}>
        <Text style={styles.stat}>⚡ Battery: {battery}%</Text>
        <Text style={styles.stat}>🚀 Speed: {speed} mph</Text>
        <Text style={styles.stat}>⏱️ Duration: {formatDuration(tripDuration)}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Navigation')}
      >
        <Text style={styles.buttonText}>🗺️ Start Navigation</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.voiceButton}>
        <Text style={styles.buttonText}>🎙️ Activate Voice Command</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 50,
  },
  statContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 40,
  },
  stat: {
    fontSize: 20,
    marginVertical: 10,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#4b7bec',
    borderRadius: 12,
    marginBottom: 15,
  },
  voiceButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#20bf6b',
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
});
