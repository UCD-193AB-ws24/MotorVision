import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Accelerometer } from 'expo-sensors';
import { useBluetoothStore } from '../store/bluetoothStore';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { db, auth } from '../config/firebase';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import * as Location from 'expo-location';

export default function RideInsightsScreen() {
  const [menu, setMenu] = useState('short'); // 'short' or 'long'
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

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
    }
    return days;
  };

  const normalizeStats = (stats) => {
    const last7Days = getLast7Days();
    return last7Days.map((date) => ({
      date,
      value: stats[date] ?? 0,
    }));
  };

  const normalizedData = normalizeStats(longTermStats);
  const labels = normalizedData.map((item) => dayjs(item.date).format('MM/DD'));
  const data = normalizedData.map((item) => item.value);

  useFocusEffect(
    useCallback(() => {
      if (menu === 'long') {
        fetchLongTermStats(auth.currentUser.uid);
      }
    }, [menu])
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
    if (!tripActive || menu !== 'short') return;

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
  }, [tripActive, menu]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Ride Insights</Text>

      <View style={styles.menu}>
        <TouchableOpacity onPress={() => setMenu('short')} style={[styles.menuButton, menu === 'short' && styles.activeButton]}>
          <Text style={styles.menuText}>Short Term Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenu('long')} style={[styles.menuButton, menu === 'long' && styles.activeButton]}>
          <Text style={styles.menuText}>Long Term Stats</Text>
        </TouchableOpacity>
      </View>

      {menu === 'short' ? (
        <>
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
        </>
      ) : (
        <>
          <Text style={styles.chartLabel}>Distance Per Day (mi)</Text>
          <BarChart
            data={{
              labels: labels,
              datasets: [{ data: data }],
            }}
            width={350}
            height={220}
            yAxisSuffix=" mi"
            chartConfig={chartConfig}
            fromZero={true}
            style={styles.chart}
          />
        </>
      )}
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
  menu: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  menuButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#333',
    marginHorizontal: 10,
  },
  activeButton: {
    backgroundColor: '#0A84FF',
  },
  menuText: {
    color: '#fff',
    fontSize: 14,
  },
});
