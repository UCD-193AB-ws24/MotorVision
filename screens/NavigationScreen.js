import React, { useState, useEffect, useRef } from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Modal, Linking, Image} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useBluetoothStore } from '../store/bluetoothStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebase';
import {getFriendsLocations, updateUserLocation} from './FriendsService'; 
import { doc, getDoc } from 'firebase/firestore';


const GOOGLE_MAPS_API_KEY = 'AIzaSyC0nK92oLlA1ote5BvcDKYNrEO2dlUEDpE';

export default function NavigationScreen() {
  const [region, setRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [startTripAlertShown, setStartTripAlertShown] = useState(false);
  const [endTripAlertShown, setEndTripAlertShown] = useState(false);
  const [displayDistance, setDisplayDistance] = useState(0);
  const [hasClosestSpots, setHasClosestSpots] = useState(false);
  const [mapMarkers, setMapMarkers] = useState([]);

  const [showFriendsList, setShowFriendsList] = useState(false);
  const [friendsLocations, setFriendsLocations] = useState([]);


  const [nearbyPlaces, setNearbyPlaces] = useState([]);


  

const loadFriendsLocations = async () => {
  try {
    const locations = await getFriendsLocations(auth.currentUser.uid);
    setFriendsLocations(locations);

    // Clear old friend pins (optional: if you track friend markers separately)
    clearFriendPins();

    // Drop new pins
    locations.forEach(({ email, location }) => {
      dropFriendPin(location, email);
    });
  } catch (error) {
    console.error("Error fetching friend locations:", error);
  }
};

  const openMaps = (place) => {
    console.log("THISSSSS");
    const lat = place.geometry.location.lat;
    const lng = place.geometry.location.lng;
    const name = place.name;
  
    // Using the platform-specific URL schemes for Apple Maps and Google Maps
    const appleMapsUrl = `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d&t=h`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  
    // Choose the appropriate URL based on platform
    const url = Platform.OS === 'ios' ? appleMapsUrl : googleMapsUrl;
  
    // Attempt to open the maps app with the specified URL
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Unable to open maps application.');
    });
  };

  const tripActive = useBluetoothStore((state) => state.tripActive);
  const startTrip = useBluetoothStore((state) => state.startTrip);
  const stopTrip = useBluetoothStore((state) => state.stopTrip);
  const updateTripData = useBluetoothStore((state) => state.updateTripData);


  const [showPlacesList, setShowPlacesList] = useState(false);

  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const friendsMarkersRef = useRef([]);


  const totalDistance = useRef(0);
  const prevLocation = useRef(null);
  const locationSubscription = useRef(null);
  

  const focusOnFriend = (location, index) => {
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lng);
  
    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000
    );
  
    setTimeout(() => {
      friendsMarkersRef.current[index]?.showCallout();
    }, 1000);
  };

  const dropFriendPin = (location, email) => {
    setMapMarkers((prev) => [
      ...prev,
      {
        id: `friend-${email}`,
        coordinate: {
          latitude: location.lat,
          longitude: location.lng,
        },
        title: email,
      },
    ]);
  };

  const clearFriendPins = () => {
    setMapMarkers((prev) =>
      prev.filter(marker => !marker.id?.startsWith("friend-"))
    );
  };
  


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
      if (!hasClosestSpots) {
        fetchNearbyPlaces(latitude, longitude);
        setHasClosestSpots(true);
      }

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
           <Callout onPress={() => openMaps(place)}>
            <View>
              <Text style={{ fontWeight: 'bold' }}>{place.name}</Text>
              <Text>{place.vicinity}</Text>
              <Text style={{ color: 'blue', marginTop: 5 }}>Tap here to get directions</Text>
            </View>
          </Callout>
          </Marker>
        ))}

        {friendsLocations.map((friend, index) => (
            <Marker
              key={`friend-${index}`}
              ref={(ref) => (friendsMarkersRef.current[index] = ref)}
              coordinate={{
                latitude: friend.location.lat,
                longitude: friend.location.lng,
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={{
                    uri: friend.profileImage || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y', // placeholder. Replace with the actual profile image!
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: '#fff',
                    backgroundColor: '#ccc',
                  }}
                />
              </View>
              <Callout>
                <View style={{ maxWidth: 600 }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      flexWrap: 'wrap',
                    }}
                    // numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {friend.email}
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}
      
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
        style={styles.floatingButton}
        onPress={() => setShowPlacesList(true)}
      >
        <MaterialCommunityIcons name="motorbike" size={28} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.floatingButton2}

        onPress={() => {
          loadFriendsLocations(); // Fetch updated data
          setShowFriendsList(true); // Show modal
          loadFriendsLocations(); // refresh + drop pins
        }}
      >
        <MaterialCommunityIcons name="account-multiple" size={28} color="#fff" />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.floatingButton3}

        onPress={async () => {
                  try {
                    console.log('Updating location...');
                    console.log("Current Location:", currentLocation);
                    const locationUpdated = {
                      lat: currentLocation.latitude,
                      lng: currentLocation.longitude
                    };

                    await updateUserLocation(auth.currentUser.uid, locationUpdated);
                    Alert.alert('Location Updated', 'Your location has been updated.');

                    console.log('Location updated!');
                  } catch (error) {
                    console.error('Error updating location:', error);
                  }
                }}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={28} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.startTripButton, tripActive ? styles.activeButton : null]}
        onPress={handleStartTrip}
      >
        <Text style={styles.startTripText}>
          {tripActive ? 'End Trip' : 'Start Trip'}
        </Text>
      </TouchableOpacity>

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
                    openMaps(item);
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


      <Modal visible={showFriendsList} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFriendsList(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Friends' Locations</Text>
            <FlatList
              data={friendsLocations}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    focusOnFriend(item.location, index); // create this function like focusOnPlace
                    setShowFriendsList(false);
                  }}
                >
                  <Text style={styles.placeName}>{item.email}</Text>
                  <Text style={styles.placeAddress}>
                    Location: {item.location.lat}, {item.location.lng}
                  </Text>
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
  floatingButton2: {
    position: 'absolute',
    bottom: 180,
    right: 25,
    backgroundColor: '#2C2C2E',
    borderRadius: 50,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingButton3: {
    position: 'absolute',
    bottom: 250,
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
