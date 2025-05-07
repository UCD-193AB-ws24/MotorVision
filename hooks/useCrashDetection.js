import { useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { useBluetoothStore } from '../store/bluetoothStore';
import * as Location from 'expo-location';

const THRESHOLD = 5; // Adjusted to reduce sensitivity
const CRASH_COOLDOWN_MS = 3000;

export const useCrashDetection = () => {
  const [isCrashed, setIsCrashed] = useState(false);
  const recordCrashEvent = useBluetoothStore((state) => state.recordCrashEvent);
  const tripActive = useBluetoothStore((state) => state.tripActive);
  const getSensorBuffer = useBluetoothStore((state) => state.getSensorBuffer);
  const setLastCrashBuffer = useBluetoothStore((state) => state.setLastCrashBuffer);

  let lastCrashTime = 0;

  useEffect(() => {
    let subscription;

    const subscribe = () => {
      subscription = Accelerometer.addListener(async ({ x, y, z }) => {
        if (!tripActive) return;

        const acceleration = Math.sqrt(x * x + y * y + z * z);

        if (
          acceleration > THRESHOLD &&
          Date.now() - lastCrashTime > CRASH_COOLDOWN_MS
        ) {
          console.log(`🚨 Crash detected! Acceleration: ${acceleration}`);
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

          // Record the crash event in trip data
          recordCrashEvent({
            time: new Date().toISOString(),
            speed: acceleration,
            acceleration: acceleration.toFixed(2),
            location,
          });

          // Store buffer for later export
          const buffer = getSensorBuffer();
          setLastCrashBuffer(buffer);
          console.log('🧠 Stored last crash buffer with', buffer.length, 'entries');

          // Reset crash flag after delay
          setTimeout(() => setIsCrashed(false), 5000);
        }
      });
    };

    subscribe();

    return () => {
      subscription?.remove();
    };
  }, [tripActive]);

  return isCrashed;
};
