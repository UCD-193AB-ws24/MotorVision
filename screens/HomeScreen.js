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
        setIsConnected(true);
        Alert.alert('Connected!', response.data.message || 'Failed to connect to SmartHelmet.');
      }
    } catch (err) {
      console.error('Connection Error:', err);
      setError('Connection failed. Please try again.');
      Alert.alert('Error', 'Unable to connect to SmartHelmet. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Crash Reporting
  const sendCrashReport = () => {
    console.log('🚨 Sending crash report...');
    Alert.alert('Crash Report Sent', 'Your crash report has been submitted.');
  };

  // Format Duration
  const formatDuration = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const sec = secs % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // 🌍 Live Location
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
          timeInterval: 1000, // Update every second
          // distanceInterval: 1, // Update when moved at least 1 meter
        },
        (position) => {
          if (position.coords.speed !== null) {
            const speedMps = position.coords.speed; // Speed in meters per second
            const speedMph = (speedMps * 2.23694).toFixed(1); // Convert to mph
            if(speedMph < 0) {
              setSpeed(0); // Ensure speed is not negative
            }
            else {
              setSpeed(speedMph);
            }
          }
        }
      );
    };
  
    requestLocationPermission();
  }, []);
  
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
  const [buttonText, setButtonText] = useState('Connect to SmartHelmet?');
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);

  const handleButtonPress = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://3.147.83.156:8000/connect');
      setButtonText(response.data.message);
    } catch (err) {
      setError('Error with API/Bluetooth Connection: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Helmet Rotation (Slower + Reverse + Longer Delay)
  const rotateValue = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   const startRotation = () => {
  //     Animated.timing(rotateValue, {
  //       toValue: 1,
  //       duration: 8000, // Slow down rotation to 8 seconds
  //       easing: Easing.linear,
  //       useNativeDriver: true,
  //     }).start(() => {
  //       rotateValue.setValue(0);
  //       setTimeout(startRotation, 5000); // Longer delay between rotations
  //     });
  //   };

  //   setTimeout(startRotation, 2000);

  //   return () => rotateValue.setValue(0);
  // }, []);

  const rotateInterpolation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'], // Reverse direction (counterclockwise)
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <Text style={styles.header}>MotorVision</Text>

      {/* Helmet Animation */}
      <Animated.Image
        source={require('../assets/helmet.png')}
        style={[styles.helmet, { transform: [{ rotate: rotateInterpolation }] }]}
      />

      {/* Connection Status */}
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

      {/* Bluetooth Connection Button */}
      <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
        <Text style={styles.buttonText}>
          {loading ? 'Connecting...' : isConnected ? 'Connected' : 'Connect Helmet'}
        </Text>
      </TouchableOpacity>

      {/* Error Message */}
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
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    marginTop: 10,
  },
  helmet: {
    width: 140,
    height: 140,
    marginBottom: 10,
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
    fontSize: 17,
    marginVertical: 3,
    alignContent: 'center',
    justifyContent: 'center',
    textAlign: 'center',
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
