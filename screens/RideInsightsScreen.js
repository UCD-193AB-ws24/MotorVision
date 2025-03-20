// RideInsightsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function RideInsightsScreen() {
  const [speedData, setSpeedData] = useState([0]);
  const [leanAngleData, setLeanAngleData] = useState([0]);
  const [brakingForceData, setBrakingForceData] = useState([0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeedData((data) => [...data.slice(-20), Math.random() * 80 || 0]);
      setLeanAngleData((data) => [...data.slice(-20), Math.random() * 45 || 0]);
      setBrakingForceData((data) => [...data.slice(-20), Math.random() * 100 || 0]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Only show every 5th label on the x-axis
  const formatLabels = (data) =>
    data.map((_, i) => (i % 5 === 0 ? i.toString() : ''));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Ride Insights</Text>

      {/* Speed Chart */}
      <Text style={styles.chartLabel}>Speed (mph)</Text>
      <LineChart
        data={{
          labels: formatLabels(speedData),
          datasets: [{ data: speedData.map((d) => (isNaN(d) ? 0 : d)) }],
        }}
        width={350}
        height={200}
        yAxisSuffix=" mph"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      {/* Lean Angle Chart */}
      <Text style={styles.chartLabel}>Lean Angle (°)</Text>
      <LineChart
        data={{
          labels: formatLabels(leanAngleData),
          datasets: [{ data: leanAngleData.map((d) => (isNaN(d) ? 0 : d)) }],
        }}
        width={350}
        height={200}
        yAxisSuffix="°"
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      {/* Braking Force Chart */}
      <Text style={styles.chartLabel}>Braking Force (%)</Text>
      <LineChart
        data={{
          labels: formatLabels(brakingForceData),
          datasets: [{ data: brakingForceData.map((d) => (isNaN(d) ? 0 : d)) }],
        }}
        width={350}
        height={200}
        yAxisSuffix="%"
        chartConfig={chartConfig}
        bezier
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
  propsForLabels: {
    fontSize: 12, // Reduce font size
    rotation: 0, // Prevent rotation of labels
  },
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
    color: '#FFFFFF',
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
