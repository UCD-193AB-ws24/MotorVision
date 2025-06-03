import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UserStatsCard({ totalTrips, totalDistance }) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>Total Trips: {totalTrips}</Text>
      <Text style={styles.text}>Total Distance: {totalDistance} mi</Text>
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
    alignSelf: 'center',
  },
  text: {
    fontSize: 15,
    color: '#eee',
    textAlign: 'center',
    marginVertical: 2,
  },
});
