import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UserStatsCard({ totalRides, totalMiles, avgSpeed }) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>Total Rides: {totalRides}</Text>
      <Text style={styles.text}>Total Miles: {totalMiles}</Text>
      <Text style={styles.text}>Avg Speed: {avgSpeed} mph</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#272727',
    padding: 16,
    borderRadius: 12,
    width: '80%',
    marginBottom: 20,
  },
  text: {
    fontSize: 15,
    color: '#eee',
    textAlign: 'center',
    marginVertical: 2,
  },
});
