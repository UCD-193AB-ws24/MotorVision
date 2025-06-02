import { useEffect, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { useBluetoothStore, BUFFER_RATE_HZ } from '../store/bluetoothStore';

const generateSessionId = () => {
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

export const useSensorBuffer = () => {
  const sessionId = useRef(generateSessionId()).current;
  const accelRef = useRef({ x: 0, y: 0, z: 0 });
  const gyroRef = useRef({ x: 0, y: 0, z: 0 });
  const locRef = useRef({ latitude: 0, longitude: 0 });

  // Running velocity estimate
  const velocityRef = useRef({ x: 0, y: 0, z: 0 });
  // Yaw estimate from integrated gyroscope.z
  const yawRef = useRef(0);

  useEffect(() => {
    let accelSub = null;
    let gyroSub = null;
    let locationSub = null;
    let bufferInterval = null;

    const dt = 1 / BUFFER_RATE_HZ;
    const intervalMs = dt * 1000;

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
              accuracy: Location.Accuracy.Highest,
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
      if (
        isNaN(magnitude) ||
        !accel || !gyro || !loc ||
        typeof accel.x !== 'number' || typeof gyro.x !== 'number'
      ) {
        console.warn('Skipping invalid buffer entry');
        return;
      }

      // Estimate velocity (v = ∫a dt)
      velocityRef.current = {
        x: velocityRef.current.x + accel.x * dt,
        y: velocityRef.current.y + accel.y * dt,
        z: velocityRef.current.z + accel.z * dt,
      };

      // Integrate yaw from gyro.z (approximate heading)
      yawRef.current += gyro.z * dt;

      // Estimate pitch and roll from accel
      const pitch = Math.atan2(accel.x, Math.sqrt(accel.y ** 2 + accel.z ** 2));
      const roll = Math.atan2(accel.y, Math.sqrt(accel.x ** 2 + accel.z ** 2));
      const yaw = yawRef.current;

      useBluetoothStore.getState().addSensorEntry({
        timestamp: Date.now(),
        acceleration: { ...accel, magnitude },
        gyroscope: { ...gyro },
        velocity: { ...velocityRef.current },
        orientation: { roll, pitch, yaw },
        location: { ...loc },
        source: 'buffered',
        device: Platform.OS,
        sessionId,
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
