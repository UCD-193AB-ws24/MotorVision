import { useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { useBluetoothStore } from '../store/bluetoothStore';
import * as Location from 'expo-location';

const THRESHOLD = 25; // Adjusted to reduce sensitivity
const CRASH_COOLDOWN_MS = 3000;

export const useCrashDetection = () => {
  const [isCrashed, setIsCrashed] = useState(false);
  const addCrashLog = useBluetoothStore((state) => state.addCrashLog);
  const tripActive = useBluetoothStore((state) => state.tripActive);

  let lastCrashTime = 0;

  useEffect(() => {
    let subscription;

    const subscribe = () => {
      subscription = Accelerometer.addListener(async ({ x, y, z }) => {
        if (!tripActive) return; // Only detect if trip is active

        const acceleration = Math.sqrt(x * x + y * y + z * z);

        if (
          acceleration > THRESHOLD &&
          Date.now() - lastCrashTime > CRASH_COOLDOWN_MS
        ) {
          console.log(`⚠️ Crash detected! Acceleration: ${acceleration}`);
          setIsCrashed(true);
          lastCrashTime = Date.now();

          let location = null;
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
              const position = await Location.getCurrentPositionAsync({});
              location = {
                latitude: position.coords.latitude.toFixed(4),
                longitude: position.coords.longitude.toFixed(4),
              };
            }
          } catch (error) {
            console.error('Error getting location:', error);
          }

          // Save crash log with location (if available)
          addCrashLog({
            id: Date.now().toString(),
            time: new Date().toLocaleString(),
            acceleration: acceleration.toFixed(2),
            location, // Include location in the log
          });

          setTimeout(() => setIsCrashed(false), 5000);
        }
      });
    };

    subscribe();

    return () => {
      subscription && subscription.remove();
    };
  }, [tripActive]);

  return isCrashed;
};
