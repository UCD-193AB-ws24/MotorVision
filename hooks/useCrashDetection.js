import { useEffect, useState, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { useBluetoothStore } from '../store/bluetoothStore';

const THRESHOLD = 3; // m/s² threshold for crash detection
const CRASH_COOLDOWN_MS = 3000;

export const useCrashDetection = () => {
  const [isCrashed, setIsCrashed] = useState(false);

  const tripActive = useBluetoothStore((state) => state.tripActive);
  const recordCrashEvent = useBluetoothStore((state) => state.recordCrashEvent);
  const getSensorBuffer = useBluetoothStore((state) => state.getSensorBuffer);
  const setLastCrashBuffer = useBluetoothStore((state) => state.setLastCrashBuffer);

  const lastCrashTimeRef = useRef(0);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    const handleAcceleration = async ({ x, y, z }) => {
      if (!tripActive) return;

      const acceleration = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      const now = Date.now();

      if (acceleration > THRESHOLD && now - lastCrashTimeRef.current > CRASH_COOLDOWN_MS) {
        console.log(`🚨 Crash detected! Acceleration: ${acceleration}`);
        setIsCrashed(true);
        lastCrashTimeRef.current = now;

        let location = null;
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const pos = await Location.getCurrentPositionAsync({});
            location = {
              latitude: pos.coords.latitude.toFixed(4),
              longitude: pos.coords.longitude.toFixed(4),
            };
          }
        } catch (error) {
          console.error('Failed to get location:', error);
        }

        recordCrashEvent({
          time: new Date().toISOString(),
          speed: acceleration,
          acceleration: acceleration.toFixed(2),
          location,
        });

        const buffer = getSensorBuffer();
        setLastCrashBuffer(buffer);
        console.log(`🧠 Stored crash buffer (${buffer.length} entries)`);

        setTimeout(() => setIsCrashed(false), 5000);
      }
    };

    Accelerometer.setUpdateInterval(100); // 10Hz
    subscriptionRef.current = Accelerometer.addListener(handleAcceleration);

    return () => {
      subscriptionRef.current?.remove();
    };
  }, [tripActive]);

  return isCrashed;
};
