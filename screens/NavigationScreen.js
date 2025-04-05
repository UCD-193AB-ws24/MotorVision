import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useBluetoothStore } from '../store/bluetoothStore';

export default function NavigationScreen() {
  const [region, setRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [startTripAlertShown, setStartTripAlertShown] = useState(false);
  const [endTripAlertShown, setEndTripAlertShown] = useState(false);

  // Zustand state for trip status
  const tripActive = useBluetoothStore((state) => state.tripActive);
  const startTrip = useBluetoothStore((state) => state.startTrip);
  const stopTrip = useBluetoothStore((state) => state.stopTrip);
  const updateTripData = useBluetoothStore((state) => state.updateTripData);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setCurrentLocation({ latitude, longitude });
    })();
  }, []);

  useEffect(() => {
    const locationSubscription = Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 10 },
      (location) => {
        const { latitude, longitude } = location.coords;
        setCurrentLocation({ latitude, longitude });
      }
    );

    return () => locationSubscription.remove();
  }, []);

  // Handle Start/End Trip
  const handleStartTrip = async () => {
    if (tripActive) {
      // Show alert the first time the user ends a trip
      if (!endTripAlertShown) {
        Alert.alert(
          'Trip Ended',
          'Trip tracking has been stopped. Your trip data will be saved and available in the trip history.'
        );
        setEndTripAlertShown(true);
      }

      stopTrip();

      // Stop location updates
      if (locationSubscription) {
        locationSubscription.remove();
        setLocationSubscription(null);
      }
    } else {
      // Show alert the first time the user starts a trip
      if (!startTripAlertShown) {
        Alert.alert(
          'Trip Started',
          'Trip tracking has begun! Your location, speed, and distance will be recorded in real time.'
        );
        setStartTripAlertShown(true);
      }

      startTrip();

      // Start location updates for trip tracking
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every second
          distanceInterval: 1, // Minimum distance change to trigger an update
        },
        (position) => {
          if (tripActive) {
            const { speed, latitude, longitude } = position.coords;

            // Calculate distance using Haversine formula
            if (region) {
              const distance = calculateDistance(
                region.latitude,
                region.longitude,
                latitude,
                longitude
              );

              updateTripData({
                distance,
                speed: speed || 0,
              });

              // Update the region for the next distance calculation
              setRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
            }
          }
        }
      );

      setLocationSubscription(subscription);
    }
  };

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius of the earth in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    return distance;
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
      {/* Map */}
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {currentLocation && <Marker coordinate={currentLocation} title="You are here" />}
      </MapView>

      {/* Overlay for current location */}
      <View style={styles.overlay}>
        {currentLocation && (
          <Text style={styles.overlayText}>
            Latitude: {currentLocation.latitude.toFixed(6)}, Longitude: {currentLocation.longitude.toFixed(6)}
          </Text>
        )}
      </View>

      {/* Start Trip Button (Overlay) */}
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
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
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
    elevation: 5, // Shadow for Android
  },
  activeButton: {
    backgroundColor: '#FF3B30', // Red color when trip is active
  },
  startTripText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
