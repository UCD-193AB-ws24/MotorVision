import { useEffect, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as Location from 'expo-location';
import { useBluetoothStore, BUFFER_RATE_HZ } from '../store/bluetoothStore';

export const useSensorBuffer = () => {
  const accelRef = useRef({ x: 0, y: 0, z: 0 });
  const gyroRef = useRef({ x: 0, y: 0, z: 0 });
  const locRef = useRef({ latitude: 0, longitude: 0 });

  useEffect(() => {
    let accelSub = null;
    let gyroSub = null;
    let locationSub = null;
    let bufferInterval = null;

    const intervalMs = 1000 / BUFFER_RATE_HZ;

    Accelerometer.setUpdateInterval(intervalMs);
    Gyroscope.setUpdateInterval(intervalMs);

    accelSub = Accelerometer.addListener((data) => {
      accelRef.current = data;
    });

    gyroSub = Gyroscope.addListener((data) => {
      gyroRef.current = data;
    });

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          locationSub = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: intervalMs,
              distanceInterval: 1,
            },
            (pos) => {
              locRef.current = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              };
            }
          );
        } else {
          console.warn('Location permission not granted');
        }
      } catch (err) {
        console.error('Error starting location watch:', err);
      }
    })();

    bufferInterval = setInterval(() => {
      const accel = accelRef.current;
      const gyro = gyroRef.current;
      const loc = locRef.current;

      const magnitude = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);

      useBluetoothStore.getState().addSensorEntry({
        timestamp: Date.now(),
        acceleration: { ...accel, magnitude },
        gyroscope: { ...gyro },
        location: { ...loc },
      });
    }, intervalMs);

    return () => {
      accelSub?.remove();
      gyroSub?.remove();
      locationSub?.remove();
      clearInterval(bufferInterval);
    };
  }, []);
};
