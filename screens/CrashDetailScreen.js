import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function CrashDetailScreen({ route, navigation }) {
  const { crash } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Crash Details</Text>

      <View style={styles.detailCard}>
        {/* Date */}
        <Text style={styles.label}>📅 Date & Time:</Text>
        <Text style={styles.value}>{crash.time}</Text>

        {/* Location (if available) */}
        {crash.location ? (
          <>
            <Text style={styles.label}>🌍 Location:</Text>
            <Text style={styles.value}>
              {crash.location.latitude}°, {crash.location.longitude}°
            </Text>
          </>
        ) : (
          <Text style={styles.label}>🌍 Location: Not available</Text>
        )}

        {/* Acceleration */}
        <Text style={styles.label}>⚡ Acceleration:</Text>
        <Text style={styles.value}>{crash.acceleration} m/s²</Text>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Logs</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    color: '#888',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  backButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
