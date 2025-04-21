import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated, Easing, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useCrashDetection } from '../hooks/useCrashDetection';
import * as Location from 'expo-location';

export default function HomeScreen({ navigation }) {
  const [speed, setSpeed] = useState(0);
  const [battery, setBattery] = useState(100);
  const [tripDuration, setTripDuration] = useState(0);
  const isCrashed = useCrashDetection();

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle Bluetooth Connection
  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://3.147.83.156:8000/connect/');
      console.log('Helmet connection response:', response.data);

      if (response.data.success) {
        setIsConnected(true);
        Alert.alert('Connected', 'SmartHelmet is now connected.');
      } else {
        setIsConnected(false);
        Alert.alert('Connection Failed', response.data.message || 'Failed to connect to SmartHelmet.');
      }
    } catch (err) {
      console.error('Connection Error:', err);
      setError('Connection failed. Please try again.');
      Alert.alert('Error', 'Unable to connect to SmartHelmet. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setBattery((prev) => (prev > 0 ? (prev - 0.1).toFixed(1) : 100));
      setTripDuration((prev) => prev + 1);
    }, 1500);

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
  }, [isCrashed]); // Ensures this effect runs only when isCrashed changes.

  const sendCrashReport = () => {
    console.log('🚨 Sending crash report...');
    Alert.alert('Crash Report Sent', 'Your crash report has been submitted.');
  };

  const formatDuration = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const sec = secs % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const [location, setLocation] = useState(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to track speed.');
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
        },
        (position) => {
          if (position.coords.speed !== null) {
            const speedMps = position.coords.speed;
            const speedMph = (speedMps * 2.23694).toFixed(1); // Convert to mph
            setSpeed(speedMph);
          }

          setLocation({
            latitude: position.coords.latitude.toFixed(2),
            longitude: position.coords.longitude.toFixed(2),
          });
        }
      );
    };

    requestLocationPermission();
  }, []); // Runs only once when the component mounts

  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startRotation = () => {
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        rotateValue.setValue(0);
        setTimeout(startRotation, 5000);
      });
    };

    setTimeout(startRotation, 2000);

    return () => rotateValue.setValue(0);
  }, []);

  const rotateInterpolation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.header}>MotorVision</Text>

      <Animated.Image
        source={require('../assets/helmet.png')}
        style={[styles.helmet, { transform: [{ rotate: rotateInterpolation }] }]}
      />

      <View style={styles.statusContainer}>
        <Ionicons
          name={isConnected ? 'checkmark-circle' : 'alert-circle'}
          size={18}
          color={isConnected ? '#00ff00' : '#ff4d4d'}
        />
        <Text style={[styles.statusText, { color: isConnected ? '#00ff00' : '#ff4d4d' }]}>
          {isConnected ? 'Connected' : 'Not Connected'}
        </Text>
      </View>

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

      {isCrashed && <Text style={styles.crashText}>⚠️ Crash Detected!</Text>}

      <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
        <Text style={styles.buttonText}>
          {loading ? 'Connecting...' : isConnected ? 'Connected' : 'Connect Helmet'}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  helmet: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  statCard: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    width: '80%',
    marginBottom: 16,
  },
  mainStat: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  unit: {
    color: '#888',
    fontSize: 14,
  },
  infoContainer: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    width: '80%',
    marginBottom: 16,
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
    marginVertical: 2,
  },
  crashText: {
    color: '#ff4d4d',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  connectButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    color: '#ff4d4d',
    marginTop: 10,
  },
});
