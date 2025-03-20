// hooks/useCrashDetection.js
import { useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { useBluetoothStore } from '../store/bluetoothStore';

const THRESHOLD = 25;
const CRASH_COOLDOWN_MS = 3000;

export const useCrashDetection = () => {
  const [isCrashed, setIsCrashed] = useState(false);
  const addCrashLog = useBluetoothStore((state) => state.addCrashLog);
  const tripActive = useBluetoothStore((state) => state.tripActive); // Access trip state

  let lastCrashTime = 0;

  useEffect(() => {
    let subscription;

    const subscribe = () => {
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        if (!tripActive) return; // 🚨 Only detect crashes when trip is active

        const acceleration = Math.sqrt(x * x + y * y + z * z);

        if (
          acceleration > THRESHOLD &&
          Date.now() - lastCrashTime > CRASH_COOLDOWN_MS
        ) {
          console.log(`⚠️ Crash detected! Acceleration: ${acceleration}`);
          setIsCrashed(true);
          lastCrashTime = Date.now();

          // Save crash log to Zustand
          addCrashLog({
            time: new Date().toLocaleString(),
            acceleration: acceleration.toFixed(2),
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
