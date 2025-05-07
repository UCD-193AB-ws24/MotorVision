// hooks/useSensorBuffer.js
import { useEffect } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as Location from 'expo-location';
import { useBluetoothStore, BUFFER_RATE_HZ } from '../store/bluetoothStore';

export const useSensorBuffer = () => {
  useEffect(() => {
    let accelSub = null;
    let gyroSub = null;
    let locationSub = null;

    let latestAccel = { x: 0, y: 0, z: 0 };
    let latestGyro = { x: 0, y: 0, z: 0 };
    let latestLoc = { latitude: 0, longitude: 0 };

    const updateBuffer = () => {
      const magnitude = Math.sqrt(
        latestAccel.x ** 2 +
        latestAccel.y ** 2 +
        latestAccel.z ** 2
      );

      const entry = {
        timestamp: Date.now(),
        acceleration: { ...latestAccel, magnitude },
        gyroscope: { ...latestGyro },
        location: { ...latestLoc },
      };

      useBluetoothStore.getState().addSensorEntry(entry);
    };

    // Set sampling interval based on buffer rate
    const intervalMs = 1000 / BUFFER_RATE_HZ;

    Accelerometer.setUpdateInterval(intervalMs);
    Gyroscope.setUpdateInterval(intervalMs);

    accelSub = Accelerometer.addListener((data) => {
      latestAccel = data;
      updateBuffer(); // buffer update driven by accelerometer
    });

    gyroSub = Gyroscope.addListener((data) => {
      latestGyro = data;
    });

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        locationSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: intervalMs,
            distanceInterval: 1,
          },
          (pos) => {
            latestLoc = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
          }
        );
      } else {
        console.warn('Location permission not granted');
      }
    })();

    return () => {
      accelSub?.remove();
      gyroSub?.remove();
      locationSub?.remove();
    };
  }, []);
};
