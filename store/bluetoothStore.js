import { create } from 'zustand';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import {
  saveTripToFirestoreAndCache,
  loadTripsFromCacheOrFirestore,
  clearTripCache,
} from '../services/tripService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const metersToMiles = (meters) => meters / 1609.34;

// Firestore stats updates
async function updateTotalRides(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) {
      await setDoc(userRef, { stats: { totalRides: 1 } });
    } else {
      await updateDoc(userRef, { 'stats.totalRides': increment(1) });
    }
  } catch (err) {
    console.error('[updateTotalRides] Error:', err);
  }
}

async function updateTotalDistanceMiles(userId, miles) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 'stats.totalDistanceMiles': increment(miles) });
  } catch (err) {
    console.error('[updateTotalDistanceMiles] Error:', err);
  }
}

async function updateTotalMinutes(userId, minutes) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 'stats.totalMinutes': increment(minutes) });
  } catch (err) {
    console.error('[updateTotalMinutes] Error:', err);
  }
}

export const useBluetoothStore = create((set, get) => ({
  connectedDevice: null,
  availableDevices: [
    { id: '1', name: 'MotorVision Helmet' },
    { id: '2', name: 'Rider Audio' },
    { id: '3', name: 'GPS Unit' },
  ],
  crashLogs: [],
  tripLogs: [],
  tripActive: false,
  tripData: null,

  // Rolling sensor buffer
  sensorBuffer: [],
  addSensorEntry: (entry) => {
    const current = get().sensorBuffer;
    const updated = [...current, entry];
    if (updated.length > 720) updated.shift();
    set({ sensorBuffer: updated });
  },
  clearSensorBuffer: () => set({ sensorBuffer: [] }),
  getSensorBuffer: () => get().sensorBuffer,

  // Last crash buffer
  lastCrashBuffer: [],
  setLastCrashBuffer: (buffer) => set({ lastCrashBuffer: buffer }),
  getLastCrashBuffer: () => get().lastCrashBuffer,

  connectToDevice: (device) => set({ connectedDevice: device }),
  disconnectDevice: () => set({ connectedDevice: null }),

  startTrip: () => {
    const startTime = new Date().toISOString();
    set({
      tripActive: true,
      tripData: {
        startTime,
        endTime: null,
        totalDistance: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        crashEvents: [],
      },
    });
  },

  stopTrip: async (userId) => {
    const state = get();
    if (state.tripActive && state.tripData) {
      const endTime = new Date().toISOString();
      const updatedTripData = {
        ...state.tripData,
        endTime,
      };

      try {
        // Save trip to Firestore and cache
        await saveTripToFirestoreAndCache(updatedTripData);

        if (userId) {
          const miles = parseFloat(metersToMiles(state.tripData.totalDistance).toFixed(2));
          const start = new Date(state.tripData.startTime);
          const end = new Date(endTime);
          const durationMinutes = Math.round((end - start) / 60000);

          await updateTotalRides(userId);
          await updateTotalDistanceMiles(userId, miles);
          await updateTotalMinutes(userId, durationMinutes);
        }

        // Update local trip logs state
        const trips = await loadTripsFromCacheOrFirestore();
        set({
          tripLogs: trips.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)),
          tripActive: false,
          tripData: null,
        });
      } catch (err) {
        console.error('[stopTrip] Error saving trip or updating stats:', err);
      }
    }
  },

  updateTripData: (data) => {
    set((state) => {
      if (!state.tripActive || !state.tripData) return state;
      const updatedData = {
        ...state.tripData,
        totalDistance: state.tripData.totalDistance + data.distance,
        averageSpeed:
          state.tripData.averageSpeed > 0
            ? (state.tripData.averageSpeed + data.speed) / 2
            : data.speed,
        maxSpeed: Math.max(state.tripData.maxSpeed, data.speed),
      };
      return { tripData: updatedData };
    });
  },

  recordCrashEvent: (event) => {
    set((state) => {
      if (!state.tripActive || !state.tripData) return state;
      const updatedData = {
        ...state.tripData,
        crashEvents: [...state.tripData.crashEvents, event],
      };
      return { tripData: updatedData };
    });
  },

  // CRUD crash logs
  addCrashLog: async (data) => {
    const newLogs = [...get().crashLogs, data];
    set({ crashLogs: newLogs });
    await AsyncStorage.setItem('crashLogs', JSON.stringify(newLogs));
  },
  loadCrashLogs: async () => {
    try {
      const logs = await AsyncStorage.getItem('crashLogs');
      if (logs) set({ crashLogs: JSON.parse(logs) });
    } catch (error) {
      console.error('Error loading crash logs:', error);
    }
  },
  deleteCrashLog: async (id) => {
    const updatedLogs = get().crashLogs.filter((log) => log.id !== id);
    set({ crashLogs: updatedLogs });
    await AsyncStorage.setItem('crashLogs', JSON.stringify(updatedLogs));
  },
  clearCrashLogs: async () => {
    set({ crashLogs: [] });
    await AsyncStorage.removeItem('crashLogs');
  },

  // CRUD trip logs using tripService
  loadTripLogs: async () => {
    try {
      const trips = await loadTripsFromCacheOrFirestore();
      set({
        tripLogs: trips.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)),
      });
    } catch (err) {
      console.error('Error loading trip logs:', err);
    }
  },
  clearTripLogs: async () => {
    try {
      await clearTripCache();
      set({ tripLogs: [], tripActive: false, tripData: null });
    } catch (err) {
      console.error('Error clearing trip logs:', err);
    }
  },
  deleteTrip: async (index) => {
    try {
      const updatedTrips = get().tripLogs.filter((_, i) => i !== index);
      set({ tripLogs: updatedTrips });
      await AsyncStorage.setItem('tripLogs', JSON.stringify(updatedTrips));
    } catch (err) {
      console.error('Error deleting trip log:', err);
    }
  },

  setTripActive: (active) => set({ tripActive: active }),
}));
