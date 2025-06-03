// tripService.js
import { collection, addDoc, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';

const CACHE_KEY = 'tripLogs';
const CACHE_LAST_FETCH_KEY = 'tripLogsLastFetch';
const CACHE_EXPIRY_HOURS = 24;

// Save a trip to Firestore and update local cache
export const saveTripToFirestoreAndCache = async (tripData) => {
  const user = auth.currentUser;
  if (!user) return;

  // Save to Firestore
  const tripRef = collection(db, 'users', user.uid, 'tripLogs');
  await addDoc(tripRef, tripData);

  // Update local cache
  const cachedTrips = JSON.parse(await AsyncStorage.getItem(CACHE_KEY)) || [];
  cachedTrips.push(tripData);
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cachedTrips));
};

// Load trips from AsyncStorage if fresh, otherwise from Firestore
export const loadTripsFromCacheOrFirestore = async () => {
  const now = Date.now();
  const lastFetch = parseInt(await AsyncStorage.getItem(CACHE_LAST_FETCH_KEY) || '0', 10);

  // Check if local cache is fresh
  if (now - lastFetch < CACHE_EXPIRY_HOURS * 3600 * 1000) {
    const cachedTrips = await AsyncStorage.getItem(CACHE_KEY);
    if (cachedTrips) {
      console.log('[TripService] Using cached trip logs');
      return JSON.parse(cachedTrips);
    }
  }

  // Cache is stale or missing, fetch from Firestore
  const user = auth.currentUser;
  if (!user) return [];

  const tripRef = collection(db, 'users', user.uid, 'tripLogs');
  const snapshot = await getDocs(tripRef);
  const trips = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Update local cache
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(trips));
  await AsyncStorage.setItem(CACHE_LAST_FETCH_KEY, now.toString());

  return trips;
};

// Clear local trip cache (e.g., when logging out or switching accounts)
export const clearTripCache = async () => {
  await AsyncStorage.removeItem(CACHE_KEY);
  await AsyncStorage.removeItem(CACHE_LAST_FETCH_KEY);
};
