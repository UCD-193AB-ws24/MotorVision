import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCrashDetection } from '../hooks/useCrashDetection';

export default function HomeScreen({ navigation }) {
  const [speed, setSpeed] = useState(0);
  const [battery, setBattery] = useState(100);
  const [tripDuration, setTripDuration] = useState(0);

  // Crash Detection Hook
  const isCrashed = useCrashDetection();

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed((Math.random() * 60).toFixed(1));
      setBattery((prev) => (prev > 0 ? (prev - 0.1).toFixed(1) : 100));
      setTripDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle Crash Detection Alert
  useEffect(() => {
    if (isCrashed) {
      Alert.alert(
        'Crash Detected!',
        'A crash-like event was detected. Do you want to report it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Report', onPress: () => sendCrashReport() }
        ]
      );
    }
  }, [isCrashed]);

  // Simulated Crash Report
  const sendCrashReport = () => {
    console.log('🚨 Sending crash report...');
    Alert.alert('Crash Report Sent', 'Your crash report has been submitted.');
  };

  const formatDuration = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const sec = secs % 60;
    return `${hrs}:${mins.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.header}>MotorVision</Text>

      <View style={styles.statCard}>
        <Text style={styles.mainStat}>{speed}</Text>
        <Text style={styles.unit}>mph</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>⚡ Battery: {battery}%</Text>
        <Text style={styles.infoText}>🕒 Duration: {formatDuration(tripDuration)}</Text>
      </View>

      {/* Crash Alert Indicator */}
      {isCrashed && (
        <Text style={styles.crashText}>⚠️ Crash Detected!</Text>
      )}

      <TouchableOpacity
        style={styles.voiceButton}
        onPress={() => navigation.navigate('Navigation')}
      >
        <Ionicons name="mic" size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 50,
  },
  statCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    marginBottom: 30,
    width: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 10,
  },
  mainStat: {
    color: '#ffffff',
    fontSize: 60,
    fontWeight: '200',
  },
  unit: {
    color: '#888',
    fontSize: 18,
  },
  infoContainer: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  infoText: {
    color: '#ccc',
    fontSize: 18,
    marginVertical: 4,
  },
  crashText: {
    color: '#ff3b30',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  voiceButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0A84FF',
    shadowColor: '#0A84FF',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
});
