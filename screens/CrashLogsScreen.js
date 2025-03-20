import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useBluetoothStore } from '../store/bluetoothStore';
import { Ionicons } from '@expo/vector-icons';

export default function CrashLogsScreen() {
  const crashLogs = useBluetoothStore((state) => state.crashLogs);
  const loadCrashLogs = useBluetoothStore((state) => state.loadCrashLogs);
  const deleteCrashLog = useBluetoothStore((state) => state.deleteCrashLog);
  const clearCrashLogs = useBluetoothStore((state) => state.clearCrashLogs);

  useEffect(() => {
    loadCrashLogs(); // Load logs from AsyncStorage on mount
  }, []);

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

  const handleDeleteLog = (id) => {
    Alert.alert(
      'Delete Crash Log',
      'Are you sure you want to delete this log?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteCrashLog(id) }
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <View style={styles.logDetails}>
                <Text style={styles.logText}>📅 {item.time}</Text>
                <Text style={styles.logText}>⚡ Acceleration: {item.acceleration} m/s²</Text>
              </View>

              {/* Delete Button */}
              <TouchableOpacity onPress={() => handleDeleteLog(item.id)}>
                <Ionicons
                  name="trash-outline"
                  size={24}
                  color="#ff4d4d"
                  style={styles.trashIcon}
                />
              </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align delete icon to the center
  },
  logDetails: {
    flexShrink: 1, // Prevent text from overflowing
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
  trashIcon: {
    padding: 8,
  },
  clearButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
