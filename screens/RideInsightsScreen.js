import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Accelerometer } from 'expo-sensors';
import { useBluetoothStore } from '../store/bluetoothStore';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { db, auth } from '../config/firebase';
import { useFocusEffect } from '@react-navigation/native';

import * as Location from 'expo-location';


export default function RideInsightsScreen() {
  const [speedData, setSpeedData] = useState([0]);
  const [accelData, setAccelData] = useState([0]);
  const [speed, setSpeed] = useState(0);
  const speedRef = useRef(0);
  const [leanAngleData, setLeanAngleData] = useState([0]);
  const [brakingForceData, setBrakingForceData] = useState([0]);
  const tripActive = useBluetoothStore((state) => state.tripActive);
  const [longTermStats, setLongTermStats] = useState({});

  const fetchLongTermStats = async (userId) => {
    const db = getFirestore();
    const userRef = doc(db, `users/${userId}`);
    const docSnap = await getDoc(userRef);
  
    if (docSnap.exists()) {
      const data = docSnap.data();
      setLongTermStats(data.longTermStats || {});
    }
  };


  useFocusEffect(
    useCallback(() => {
      fetchLongTermStats(auth.currentUser.uid); 
    }, [])
  );
  

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to track speed.');
        return;
      }

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
        },
        (position) => {
          if (position.coords.speed !== null) {
            const speedMps = position.coords.speed;
            const speedMph = (speedMps * 2.23694).toFixed(1);
            setSpeed(speedMph);
            speedRef.current = speedMph;
          }
        }
      );
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (!tripActive) return;

    const accelSubscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      setAccelData((data) => [...data.slice(-20), parseFloat(magnitude.toFixed(2))]);
    });

    Accelerometer.setUpdateInterval(1000);

    const interval = setInterval(() => {
      if (speedRef.current < 0) speedRef.current = 0;
      setSpeedData((data) => [...data.slice(-20), parseFloat(speedRef.current)]);
      setLeanAngleData((data) => [...data.slice(-20), Math.random() * 45]);
      setBrakingForceData((data) => [...data.slice(-20), Math.random() * 100]);
    }, 1000);

    return () => {
      clearInterval(interval);
      accelSubscription && accelSubscription.remove();
    };
  }, [tripActive]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Ride Insights</Text>

      <Text style={styles.chartLabel}>Speed (mph)</Text>
      <LineChart
        data={{
          labels: Array(speedData.length).fill(''),
          datasets: [{ data: speedData }],
        }}
        width={350}
        height={200}
        yAxisSuffix=" mph"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      <Text style={styles.chartLabel}>Acceleration (m/s²)</Text>
      <LineChart
        data={{
          labels: Array(accelData.length).fill(''),
          datasets: [{ data: accelData }],
        }}
        width={350}
        height={200}
        yAxisSuffix=" m/s²"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      {/* <Text style={styles.chartLabel}>Lean Angle (°)</Text>
      <LineChart
        data={{
          labels: Array(leanAngleData.length).fill(''),
          datasets: [{ data: leanAngleData }],
        }}
        width={350}
        height={200}
        yAxisSuffix="°"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      <Text style={styles.chartLabel}>Braking Force (%)</Text>
      <LineChart
        data={{
          labels: Array(brakingForceData.length).fill(''),
          datasets: [{ data: brakingForceData }],
        }}
        width={350}
        height={200}
        yAxisSuffix="%"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      /> */}

      <Text style={styles.chartLabel}>Distance Per Day (km)</Text>
      <BarChart
        data={{
          labels: Object.keys(longTermStats),
          datasets: [
            {
              data: Object.values(longTermStats),
            },
          ],
        }}
        width={350}
        height={220}
        yAxisSuffix=" km"
        chartConfig={chartConfig}
        fromZero={true}
        style={styles.chart}
      />

    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#1E1E1E',
  backgroundGradientTo: '#1E1E1E',
  color: (opacity = 1) => `rgba(10, 132, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  decimalPlaces: 0,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartLabel: {
    color: '#888',
    fontSize: 16,
    marginBottom: 5,
    marginTop: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
