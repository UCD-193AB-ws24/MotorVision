import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useBluetoothStore } from '../store/bluetoothStore';
import { Ionicons } from '@expo/vector-icons';

export default function CrashLogsScreen({ navigation }) {
  const crashLogs = useBluetoothStore((state) => state.crashLogs);
  const loadCrashLogs = useBluetoothStore((state) => state.loadCrashLogs);
  const deleteCrashLog = useBluetoothStore((state) => state.deleteCrashLog);
  const clearCrashLogs = useBluetoothStore((state) => state.clearCrashLogs);

  useEffect(() => {
    loadCrashLogs();
  }, []);

  const handleClearLogs = () => {
    Alert.alert('Clear All Logs', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', onPress: () => clearCrashLogs() },
    ]);
  };

  const handleDeleteLog = (id) => {
    Alert.alert('Delete This Log?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => deleteCrashLog(id) },
    ]);
  };

  const renderCrashItem = ({ item }) => (
    <TouchableOpacity
      style={styles.logItem}
      onPress={() => navigation.navigate('CrashDetail', { crash: item })}
    >
      <View style={styles.logDetails}>
        <Text style={styles.logText}>
          📅 {item.time || 'Unknown Time'}
        </Text>
        {item.location ? (
          <Text style={styles.logText}>
            🌍 {item.location.latitude}°, {item.location.longitude}°
          </Text>
        ) : (
          <Text style={styles.logText}>🌍 Location: Not available</Text>
        )}
        <Text style={styles.logText}>
          ⚡ Acceleration: {item.acceleration ?? 'N/A'} m/s²
        </Text>
      </View>

      <TouchableOpacity onPress={() => handleDeleteLog(item.id)}>
        <Ionicons
          name="trash-outline"
          size={24}
          color="#FF453A"
          style={styles.trashIcon}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Crash Logs</Text>

      {crashLogs.length === 0 ? (
        <Text style={styles.emptyText}>No crashes recorded yet.</Text>
      ) : (
        <FlatList
          data={crashLogs}
          keyExtractor={(item) => item.id}
          renderItem={renderCrashItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {crashLogs.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearLogs}>
          <Text style={styles.clearButtonText}>Clear All Logs</Text>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },
  logDetails: {
    flex: 1,
    paddingRight: 10,
  },
  logText: {
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 3,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 60,
  },
  trashIcon: {
    padding: 4,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
