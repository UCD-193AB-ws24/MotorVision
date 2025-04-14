import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Modal } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useBluetoothStore } from '../store/bluetoothStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const GOOGLE_MAPS_API_KEY = 'AIzaSyC0nK92oLlA1ote5BvcDKYNrEO2dlUEDpE';

export default function NavigationScreen() {
  const [region, setRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [displayDistance, setDisplayDistance] = useState(0);
  const [showPlacesList, setShowPlacesList] = useState(false);

  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const tripActive = useBluetoothStore((state) => state.tripActive);
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

      fetchNearbyPlaces(latitude, longitude);
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

  const fetchNearbyPlaces = async (lat, lng) => {
    try {
      const radius = 5000;
      const keyword = 'motorcycle';

      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${keyword}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setNearbyPlaces(data.results);
      } else {
        Alert.alert('No nearby places found.');
      }
    } catch (error) {
      Alert.alert('Error fetching places', error.message);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const focusOnPlace = (place, index) => {
    const lat = place.geometry.location.lat;
    const lng = place.geometry.location.lng;

    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000
    );

    // Show the callout after animating
    setTimeout(() => {
      markersRef.current[index]?.showCallout();
    }, 1000);
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
        ref={mapRef}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {currentLocation && <Marker coordinate={currentLocation} title="You are here" />}
        {nearbyPlaces.map((place, index) => (
          <Marker
            key={index}
            ref={(ref) => (markersRef.current[index] = ref)}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
          >
            <Callout>
              <Text style={{ fontWeight: 'bold' }}>{place.name}</Text>
              <Text>{place.vicinity}</Text>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.overlay}>
        {currentLocation && (
          <>
            <Text style={styles.overlayText}>
              Lat: {currentLocation.latitude.toFixed(6)}, Lng:{' '}
              {currentLocation.longitude.toFixed(6)}
            </Text>
            <Text style={styles.overlayText2}>
              Distance Traveled: {(displayDistance / 1000).toFixed(2)} km
            </Text>
          </>
        )}
      </View>

      {/* Floating Motorcycle Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setShowPlacesList(true)}
      >
        <MaterialCommunityIcons name="motorbike" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Trip Start/End Button */}
      <TouchableOpacity
        style={[styles.startTripButton, tripActive ? styles.activeButton : null]}
        onPress={() => {
          // Optional toggle tripActive logic
        }}
      >
        <Text style={styles.startTripText}>
          {tripActive ? 'End Trip' : 'Start Trip'}
        </Text>
      </TouchableOpacity>

      {/* Modal Overlay for Nearby Places List */}
      <Modal visible={showPlacesList} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPlacesList(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Local Motorcycle Facilities</Text>
            <FlatList
              data={nearbyPlaces}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    focusOnPlace(item, index);
                    setShowPlacesList(false); 
                  }}                >
                  <Text style={styles.placeName}>{item.name}</Text>
                  <Text style={styles.placeAddress}>{item.vicinity}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'rgba(0,0,0,0.75)',
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
    marginTop: 5,
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
  floatingButton: {
    position: 'absolute',
    bottom: 110,
    right: 25,
    backgroundColor: '#2C2C2E',
    borderRadius: 50,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  modalContent: {
    flex: 1,
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  placeAddress: {
    fontSize: 14,
    color: '#ccc',
  },
});
