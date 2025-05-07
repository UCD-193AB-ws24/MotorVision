import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// === Sensor Buffer Configuration ===
export const BUFFER_RATE_HZ = 4;
export const BUFFER_DURATION_MINUTES = 3;
export const MAX_BUFFER_SIZE = BUFFER_RATE_HZ * BUFFER_DURATION_MINUTES * 60;

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

  // Connect to device
  connectToDevice: (device) =>
    set({ connectedDevice: device }),

  // Disconnect from device
  disconnectDevice: () =>
    set({ connectedDevice: null }),

  // Start a new trip
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

  // Stop trip and store data
  stopTrip: async () => {
    const state = get();
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

        set({
          tripLogs: newTrips.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)),
          tripActive: false,
          tripData: null,
        });
      } catch (err) {
        console.error('Error saving trip log:', err);
      }
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

  // Delete individual crash log
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

  // Delete individual trip log
  deleteTrip: async (index) => {
    try {
      const updatedTrips = get().tripLogs.filter((_, i) => i !== index);
      set({ tripLogs: updatedTrips });
      await AsyncStorage.setItem('tripLogs', JSON.stringify(updatedTrips));
    } catch (err) {
      console.error('Error deleting trip log:', err);
    }
  },

  // Clear all trip logs
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
