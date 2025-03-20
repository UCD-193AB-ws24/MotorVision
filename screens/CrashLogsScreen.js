// screens/CrashLogsScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useBluetoothStore } from '../store/bluetoothStore';

export default function CrashLogsScreen() {
  const { crashLogs, clearCrashLogs } = useBluetoothStore();

  const handleClearLogs = () => {
    Alert.alert(
      'Clear Crash Logs',
      'Are you sure you want to clear all crash logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => clearCrashLogs() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Crash Logs</Text>

      {crashLogs.length === 0 ? (
        <Text style={styles.emptyText}>No crashes detected yet.</Text>
      ) : (
        <FlatList
          data={crashLogs}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <Text style={styles.logText}>📅 {item.time}</Text>
              <Text style={styles.logText}>⚡ Acceleration: {item.acceleration} m/s²</Text>
            </View>
          )}
        />
      )}

      {crashLogs.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearLogs}>
          <Text style={styles.clearButtonText}>Clear Logs</Text>
        </TouchableOpacity>
      )}
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
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  logItem: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  logText: {
    color: '#ffffff',
    fontSize: 16,
  },
  emptyText: {
    color: '#888',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  clearButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
