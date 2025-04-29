import { useEffect, useState } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { useBluetoothStore } from '../store/bluetoothStore';
import * as Location from 'expo-location';

const THRESHOLD = 5; // Acceleration threshold for crash detection
const CRASH_COOLDOWN_MS = 3000;

export const useCrashDetection = () => {
  const [isCrashed, setIsCrashed] = useState(false);
  const recordCrashEvent = useBluetoothStore((state) => state.recordCrashEvent);
  const tripActive = useBluetoothStore((state) => state.tripActive);

  let lastCrashTime = 0;

  useEffect(() => {
    let accelSubscription;
    let gyroSubscription;
    let latestGyroData = { x: 0, y: 0, z: 0 };

    const subscribe = () => {
      // Track latest gyroscope data in background
      gyroSubscription = Gyroscope.addListener(({ x, y, z }) => {
        latestGyroData = { x, y, z };
      });
      Gyroscope.setUpdateInterval(500); // Update every 0.5 seconds

      // Monitor accelerometer for crash detection
      accelSubscription = Accelerometer.addListener(async ({ x, y, z }) => {
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

          // Record crash event including gyroscope data
          recordCrashEvent({
            time: new Date().toISOString(),
            speed: acceleration, // Estimate
            acceleration: acceleration.toFixed(2),
            location,
            gyroscope: {
              x: latestGyroData.x.toFixed(4),
              y: latestGyroData.y.toFixed(4),
              z: latestGyroData.z.toFixed(4),
            },
          });

          setTimeout(() => setIsCrashed(false), 5000);
        }
      });
      Accelerometer.setUpdateInterval(500); // Update every 0.5 seconds
    };

    subscribe();

    return () => {
      accelSubscription && accelSubscription.remove();
      gyroSubscription && gyroSubscription.remove();
    };
  }, [tripActive]);

  return isCrashed;
};
