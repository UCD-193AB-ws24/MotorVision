// store/bluetoothStore.js
import { create } from 'zustand';

export const useBluetoothStore = create((set) => ({
  connectedDevice: null,
  availableDevices: [
    { id: '1', name: 'MotorVision Helmet' },
    { id: '2', name: 'Rider Audio' },
    { id: '3', name: 'GPS Unit' }
  ],
  connectToDevice: (device) =>
    set({ connectedDevice: device }),
  disconnectDevice: () =>
    set({ connectedDevice: null }),
}));
