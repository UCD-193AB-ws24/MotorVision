import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function CrashDetailScreen({ navigation }) {
  const route = useRoute();
  const { crash } = route.params;

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const formatSpeed = (speed) => {
    if (!speed) return '0.0 mph';
    return (speed * 2.237).toFixed(1) + ' mph';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Crash Detail</Text>

      <View style={styles.detailBox}>
        <Text style={styles.label}>Time</Text>
        <Text style={styles.value}>{formatDateTime(crash.time)}</Text>

        <Text style={styles.label}>Speed</Text>
        <Text style={styles.value}>{formatSpeed(crash.speed)}</Text>

        <Text style={styles.label}>Acceleration</Text>
        <Text style={styles.value}>
          {crash.acceleration ? `${parseFloat(crash.acceleration).toFixed(2)} m/s²` : 'N/A'}
        </Text>

        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>
          {crash.location
            ? `${crash.location.latitude}, ${crash.location.longitude}`
            : 'Not available'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to Trip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailBox: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  label: {
    color: '#bbb',
    fontSize: 16,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
