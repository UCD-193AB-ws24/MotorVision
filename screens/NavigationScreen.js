import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useBluetoothStore } from '../store/bluetoothStore';

export default function NavigationScreen() {
  const [region, setRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [startTripAlertShown, setStartTripAlertShown] = useState(false);
  const [endTripAlertShown, setEndTripAlertShown] = useState(false);
  const [displayDistance, setDisplayDistance] = useState(0);

  const tripActive = useBluetoothStore((state) => state.tripActive);
  const startTrip = useBluetoothStore((state) => state.startTrip);
  const stopTrip = useBluetoothStore((state) => state.stopTrip);
  const updateTripData = useBluetoothStore((state) => state.updateTripData);

  const totalDistance = useRef(0);
  const prevLocation = useRef(null);
  const locationSubscription = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const initialRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(initialRegion);
      setCurrentLocation({ latitude, longitude });
      prevLocation.current = { latitude, longitude };
    })();
  }, []);

  useEffect(() => {
    if (!tripActive) return;

    const subscribe = async () => {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (position) => {
          const { latitude, longitude, speed } = position.coords;
          const newLocation = { latitude, longitude };

          if (tripActive && prevLocation.current) {
            const distance = calculateDistance(
              prevLocation.current.latitude,
              prevLocation.current.longitude,
              latitude,
              longitude
            );

            totalDistance.current += distance;
            setDisplayDistance(totalDistance.current);

            updateTripData({
              distance,
              speed: speed || 0,
            });
          }

          prevLocation.current = newLocation;
          setCurrentLocation(newLocation);
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      );

      locationSubscription.current = subscription;
    };

    subscribe();

    return () => {
      locationSubscription.current?.remove();
      locationSubscription.current = null;
    };
  }, [tripActive]);

  const handleStartTrip = async () => {
    if (tripActive) {
      if (!endTripAlertShown) {
        Alert.alert('Trip Ended', 'Trip tracking has stopped and data will be saved.');
        setEndTripAlertShown(true);
      }
      stopTrip();
      locationSubscription.current?.remove();
      locationSubscription.current = null;
    } else {
      if (!startTripAlertShown) {
        Alert.alert('Trip Started', 'Your trip is now being tracked.');
        setStartTripAlertShown(true);
      }

      totalDistance.current = 0;
      setDisplayDistance(0);
      prevLocation.current = currentLocation;
      startTrip();
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  if (!region) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {currentLocation && <Marker coordinate={currentLocation} title="You are here" />}
      </MapView>

      <View style={styles.overlay}>
        {currentLocation && (
          <>
            <Text style={styles.overlayText}>
              Latitude: {currentLocation.latitude.toFixed(6)}, Longitude: {currentLocation.longitude.toFixed(6)}
            </Text>
            <Text style={styles.overlayText2}>
              Distance Traveled: {(displayDistance / 1000).toFixed(2)} km
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.startTripButton, tripActive ? styles.activeButton : null]}
        onPress={handleStartTrip}
      >
        <Text style={styles.startTripText}>
          {tripActive ? 'End Trip' : 'Start Trip'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  overlay: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
  },
  overlayText2: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  startTripButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#0A84FF',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  activeButton: {
    backgroundColor: '#FF3B30',
  },
  startTripText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
