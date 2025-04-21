import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useBluetoothStore = create((set, get) => ({
  connectedDevice: null,
  availableDevices: [
    { id: '1', name: 'MotorVision Helmet' },
    { id: '2', name: 'Rider Audio' },
    { id: '3', name: 'GPS Unit' },
  ],
  crashLogs: [],
  tripActive: false,

  // Connect to device
  connectToDevice: (device) =>
    set({ connectedDevice: device }),

  // Disconnect device
  disconnectDevice: () =>
    set({ connectedDevice: null }),

  // Add new crash log (also store in AsyncStorage)
  addCrashLog: async (data) => {
    const newLogs = [...get().crashLogs, data];
    set({ crashLogs: newLogs });
    await AsyncStorage.setItem('crashLogs', JSON.stringify(newLogs));
  },

  // Load logs from AsyncStorage
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

  // Clear all logs
  clearCrashLogs: async () => {
    set({ crashLogs: [] });
    await AsyncStorage.removeItem('crashLogs');
  },

  // Set trip state
  setTripActive: (active) =>
    set({ tripActive: active }),
}));
