import { useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { useBluetoothStore } from '../store/bluetoothStore';
import * as Location from 'expo-location';

const THRESHOLD = 10; // Adjusted to reduce sensitivity
const CRASH_COOLDOWN_MS = 3000;

export const useCrashDetection = () => {
  const [isCrashed, setIsCrashed] = useState(false);
  const recordCrashEvent = useBluetoothStore((state) => state.recordCrashEvent);
  const tripActive = useBluetoothStore((state) => state.tripActive);

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
          console.log(`Crash detected! Acceleration: ${acceleration}`);
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

          // Record crash event in the trip log
          recordCrashEvent({
            time: new Date().toISOString(),
            speed: acceleration, // Treating acceleration as an estimate for speed
            acceleration: acceleration.toFixed(2),
            location,
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
