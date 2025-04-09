import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated,
  Easing, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCrashDetection } from '../hooks/useCrashDetection';

export default function HomeScreen({ navigation }) {
  const [speed, setSpeed] = useState(0);
  const [battery, setBattery] = useState(100);
  const [tripDuration, setTripDuration] = useState(0);
  const isCrashed = useCrashDetection();
  const [userName, setUserName] = useState('');
  const [location, setLocation] = useState(null);

  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        const stored = await AsyncStorage.getItem('userInfo');
        if (stored) {
          const { name } = JSON.parse(stored);
          setUserName(name);
        }
      };
      loadUser();
    }, [])
  );

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://3.147.83.156:8000/connect/');
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
      Alert.alert('Error', 'Unable to connect to SmartHelmet.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const sec = secs % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
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
            const speedMph = (speedMps * 2.23694).toFixed(1);
            setSpeed(speedMph < 0 ? 0 : speedMph);
          }
        }
      );
    };

    requestLocationPermission();
  }, []);

  React.useEffect(() => {
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

  const rotateValue = useRef(new Animated.Value(0)).current;

  const rotateInterpolation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      
      <Text style={styles.header}>MotorVision</Text>
      
      {userName !== '' && (
        <Text style={styles.greeting}>Welcome back, {userName}!</Text>
      )}

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
          <Text style={styles.infoText}>🌍 {location.latitude}°, {location.longitude}°</Text>
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
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 12,
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
