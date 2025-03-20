// store/bluetoothStore.js
import { create } from 'zustand';

export const useBluetoothStore = create((set) => ({
  connectedDevice: null,
  availableDevices: [
    { id: '1', name: 'MotorVision Helmet' },
    { id: '2', name: 'Rider Audio' },
    { id: '3', name: 'GPS Unit' }
  ],
  crashLogs: [],
  tripActive: false, // Track whether trip is active
  connectToDevice: (device) =>
    set({ connectedDevice: device }),
  disconnectDevice: () =>
    set({ connectedDevice: null }),
  addCrashLog: (data) =>
    set((state) => ({
      crashLogs: [...state.crashLogs, data]
    })),
  clearCrashLogs: () =>
    set({ crashLogs: [] }),
  setTripActive: (active) =>
    set({ tripActive: active }),
}));
