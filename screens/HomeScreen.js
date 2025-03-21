import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated, Easing, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCrashDetection } from '../hooks/useCrashDetection';
import { useBluetoothStore } from '../store/bluetoothStore';
import * as Location from 'expo-location';
import axios from 'axios';

export default function HomeScreen({ navigation }) {
  const [speed, setSpeed] = useState(0);
  const [battery, setBattery] = useState(100);
  const [tripDuration, setTripDuration] = useState(0);
  const isCrashed = useCrashDetection();

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed((Math.random() * 60).toFixed(1));
      setBattery((prev) => (prev > 0 ? (prev - 0.1).toFixed(1) : 100));
      setTripDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  // 🌍 Live Location
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 5000,
            distanceInterval: 2,
          },
          (position) => {
            setLocation({
              latitude: position.coords.latitude.toFixed(2),
              longitude: position.coords.longitude.toFixed(2),
            });
          }
        );
      }
    };

    requestLocationPermission();
  }, []);

  // Bluetooth Connection Button
  const [buttonText, setButtonText] = useState('Connect Helmet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleButtonPress = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://127.0.0.1:8000/connect/');
      setButtonText(response.data.message);
    } catch (err) {
      setError('Error with API/Bluetooth Connection: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Helmet Rotation (Slower + Reverse + Longer Delay)
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startRotation = () => {
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 8000, // Slow down rotation to 8 seconds
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        rotateValue.setValue(0);
        setTimeout(startRotation, 5000); // Longer delay between rotations
      });
    };

    setTimeout(startRotation, 2000);

    return () => rotateValue.setValue(0);
  }, []);

  const rotateInterpolation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'], // Reverse direction (counterclockwise)
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <Text style={styles.header}>MotorVision</Text>

      {/* Helmet Animation */}
      <Animated.Image
        source={require('../assets/helmet.png')}
        style={[styles.helmet, { transform: [{ rotate: rotateInterpolation }] }]}
      />

      {/* Speed + Battery */}
      <View style={styles.statCard}>
        <Text style={styles.mainStat}>{speed}</Text>
        <Text style={styles.unit}>mph</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>⚡ Battery: {battery}%</Text>
        <Text style={styles.infoText}>🕒 Duration: {formatDuration(tripDuration)}</Text>
        {location && (
          <Text style={styles.infoText}>
            🌍 {location.latitude}°, {location.longitude}°
          </Text>
        )}
      </View>

      {/* Crash Alert */}
      {isCrashed && <Text style={styles.crashText}>⚠️ Crash Detected!</Text>}

      {/* Bluetooth Button */}
      <TouchableOpacity style={styles.connectButton} onPress={handleButtonPress}>
        <Text style={styles.buttonText}>
          {loading ? 'Connecting...' : error || buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
  },
  helmet: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    width: '80%',
    marginBottom: 20,
  },
  mainStat: {
    color: '#ffffff',
    fontSize: 64,
    fontWeight: 'bold',
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
    marginBottom: 20,
  },
  infoText: {
    color: '#ccc',
    fontSize: 18,
    marginVertical: 4,
  },
  crashText: {
    color: '#ff4d4d',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  connectButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 16,
    shadowColor: '#0A84FF',
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
