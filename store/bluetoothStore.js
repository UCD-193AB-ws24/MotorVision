import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// === Sensor Buffer Configuration ===
export const BUFFER_RATE_HZ = 4;
export const BUFFER_DURATION_MINUTES = 3;
export const MAX_BUFFER_SIZE = BUFFER_RATE_HZ * BUFFER_DURATION_MINUTES * 60;
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase.js';

const metersToMiles = (meters) => meters / 1609.34;

// Update stats.totalRides
async function updateTotalRides(userId) {
  try {
    console.log('[updateTotalRides] Called with userId:', userId);
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    console.log('[updateTotalRides] Document exists:', snapshot.exists());

    if (!snapshot.exists()) {
      await setDoc(userRef, { stats: { totalRides: 1 } });
      console.log('[updateTotalRides] Created new user doc with stats.totalRides = 1');
    } else {
      await updateDoc(userRef, { 'stats.totalRides': increment(1) });
      console.log('[updateTotalRides] Incremented stats.totalRides by 1');
    }
  } catch (err) {
    console.error('[updateTotalRides] Error:', err);
  }
}

// Update stats.totalDistanceMiles
async function updateTotalDistanceMiles(userId, miles) {
  try {
    console.log('[updateTotalDistanceMiles] Called with', miles, 'miles');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 'stats.totalDistanceMiles': increment(miles) });
    console.log('[updateTotalDistanceMiles] Incremented stats.totalDistanceMiles by', miles);
  } catch (err) {
    console.error('[updateTotalDistanceMiles] Error:', err);
  }
}

// Update stats.totalMinutes
async function updateTotalMinutes(userId, minutes) {
  try {
    console.log('[updateTotalMinutes] Called with', minutes, 'minutes');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 'stats.totalMinutes': increment(minutes) });
    console.log('[updateTotalMinutes] Incremented stats.totalMinutes by', minutes);
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
    if (updated.length > MAX_BUFFER_SIZE) updated.shift();
    set({ sensorBuffer: updated });
  },
  clearSensorBuffer: () => set({ sensorBuffer: [] }),
  getSensorBuffer: () => get().sensorBuffer,

  // Last crash buffer (for user-initiated export)
  lastCrashBuffer: [],
  setLastCrashBuffer: (buffer) => set({ lastCrashBuffer: buffer }),
  getLastCrashBuffer: () => get().lastCrashBuffer,

  // Rolling sensor buffer
  sensorBuffer: [],
  addSensorEntry: (entry) => {
    const current = get().sensorBuffer;
    const updated = [...current, entry];
    if (updated.length > MAX_BUFFER_SIZE) updated.shift();
    set({ sensorBuffer: updated });
  },
  clearSensorBuffer: () => set({ sensorBuffer: [] }),
  getSensorBuffer: () => get().sensorBuffer,

  // Last crash buffer (for user-initiated export)
  lastCrashBuffer: [],
  setLastCrashBuffer: (buffer) => set({ lastCrashBuffer: buffer }),
  getLastCrashBuffer: () => get().lastCrashBuffer,

  connectToDevice: (device) => set({ connectedDevice: device }),
  disconnectDevice: () => set({ connectedDevice: null }),

  startTrip: () => {
    const startTime = new Date().toISOString();
    console.log('[startTrip] Trip started at:', startTime);
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
    console.log('[stopTrip] Called. tripActive:', state.tripActive, 'userId:', userId);

    if (state.tripActive && state.tripData) {
      const endTime = new Date().toISOString();
      const updatedTripData = {
        ...state.tripData,
        endTime,
      };

      try {
        const existingTrips = JSON.parse(await AsyncStorage.getItem('tripLogs')) || [];
        const newTrips = [...existingTrips, updatedTripData];
        await AsyncStorage.setItem('tripLogs', JSON.stringify(newTrips));
        console.log('[stopTrip] Trip saved to AsyncStorage');

        if (userId) {
          const miles = parseFloat(metersToMiles(state.tripData.totalDistance).toFixed(2));
          const start = new Date(state.tripData.startTime);
          const end = new Date(endTime);
          const durationMinutes = Math.round((end - start) / 60000);
          console.log('[stopTrip] Updating stats in Firestore:', { miles, durationMinutes });

          await updateTotalRides(userId);
          await updateTotalDistanceMiles(userId, miles);
          await updateTotalMinutes(userId, durationMinutes);
        } else {
          console.warn('[stopTrip] No userId provided. Skipping Firebase stat update.');
        }

        set({
          tripLogs: newTrips.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)),
          tripActive: false,
          tripData: null,
        });

        console.log('[stopTrip] Trip state reset and logs updated');
      } catch (err) {
        console.error('[stopTrip] Error saving trip or updating stats:', err);
      }
    } else {
      console.warn('[stopTrip] Trip was not active or tripData missing');
    }
  },

  // Update trip data during trip
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

  // Record crash event during trip
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

  // Add crash log
  addCrashLog: async (data) => {
    const newLogs = [...get().crashLogs, data];
    set({ crashLogs: newLogs });
    await AsyncStorage.setItem('crashLogs', JSON.stringify(newLogs));
  },

  // Load crash logs
  loadCrashLogs: async () => {
    try {
      const logs = await AsyncStorage.getItem('crashLogs');
      if (logs) {
        set({ crashLogs: JSON.parse(logs) });
      }
    } catch (error) {
      console.error('Error loading crash logs:', error);
    }
  },

  deleteCrashLog: async (id) => {
    const updatedLogs = get().crashLogs.filter((log) => log.id !== id);
    set({ crashLogs: updatedLogs });
    await AsyncStorage.setItem('crashLogs', JSON.stringify(updatedLogs));
  },

  // Clear all crash logs
  clearCrashLogs: async () => {
    set({ crashLogs: [] });
    await AsyncStorage.removeItem('crashLogs');
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

  clearTripLogs: async () => {
    try {
      await AsyncStorage.removeItem('tripLogs');
      set({ tripLogs: [], tripActive: false, tripData: null });
    } catch (err) {
      console.error('Error clearing trip logs:', err);
    }
  },

  // Load trip logs
  loadTripLogs: async () => {
    try {
      const logs = await AsyncStorage.getItem('tripLogs');
      if (logs) {
        const parsedLogs = JSON.parse(logs);
        set({
          tripLogs: parsedLogs.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)),
        });
      }
    } catch (err) {
      console.error('Error loading trip logs:', err);
    }
  },

  // Set trip state
  setTripActive: (active) => set({ tripActive: active }),
}));
