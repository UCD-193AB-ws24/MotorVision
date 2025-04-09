import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useBluetoothStore } from '../store/bluetoothStore';

export default function NavigationScreen() {
  const [region, setRegion] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [startTripAlertShown, setStartTripAlertShown] = useState(false);
  const [endTripAlertShown, setEndTripAlertShown] = useState(false);

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
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const handleStartTrip = async () => {
    if (tripActive) {
      if (!endTripAlertShown) {
        Alert.alert(
          'Trip Ended',
          'Trip tracking has been stopped. Your trip data will be saved and available in the trip history.'
        );
        setEndTripAlertShown(true);
      }

      stopTrip();

      if (locationSubscription) {
        locationSubscription.remove();
        setLocationSubscription(null);
      }
    } else {
      if (!startTripAlertShown) {
        Alert.alert(
          'Trip Started',
          'Trip tracking has begun! Your location, speed, and distance will be recorded in real time.'
        );
        setStartTripAlertShown(true);
      }

      startTrip();

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (position) => {
          if (tripActive) {
            const { speed, latitude, longitude } = position.coords;

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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // meters
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
        <Marker coordinate={region} title="You are here" />
      </MapView>

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
  startTripButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
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
