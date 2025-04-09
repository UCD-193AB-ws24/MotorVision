import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useBluetoothStore } from '../store/bluetoothStore';
import { Ionicons } from '@expo/vector-icons';

export default function TripHistoryScreen({ navigation }) {
  const trips = useBluetoothStore((state) => state.tripLogs);
  const loadTripLogs = useBluetoothStore((state) => state.loadTripLogs);
  const deleteTrip = useBluetoothStore((state) => state.deleteTrip);

  useEffect(() => {
    loadTripLogs();
  }, []);

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Unknown';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = (end - start) / 1000;

    const hrs = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = Math.floor(diff % 60);

    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return '0.00 mi';
    return (distance / 1609).toFixed(2) + ' mi';
  };

  const formatSpeed = (speed) => {
    if (speed === null || speed === undefined) return '0.0 mph';
    return (speed * 2.237).toFixed(1) + ' mph';
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const renderTrip = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TripDetail', { trip: item })}
      style={styles.tripItem}
    >
      <View style={styles.tripInfo}>
        <Text style={styles.tripDate}>
          {formatDateTime(item.startTime)}
        </Text>
        <Text style={styles.tripDetail}>
          Duration: {formatDuration(item.startTime, item.endTime)}
        </Text>
        <Text style={styles.tripDetail}>
          Distance: {formatDistance(item.totalDistance)}
        </Text>
        <Text style={styles.tripDetail}>
          Avg Speed: {formatSpeed(item.averageSpeed)}
        </Text>
        <Text style={styles.tripDetail}>
          Max Speed: {formatSpeed(item.maxSpeed)}
        </Text>
      </View>
      <TouchableOpacity onPress={() => deleteTrip(index)} style={styles.deleteButton}>
        <Ionicons
          name="trash-outline"
          size={24}
          color="#ff4d4d"
          style={styles.deleteIcon}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trip History</Text>

      {trips.length === 0 ? (
        <Text style={styles.emptyText}>No trips recorded yet.</Text>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderTrip}
        />
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
  tripItem: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4, // Slight shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tripInfo: {
    flexShrink: 1,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tripDetail: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 2,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    color: '#ff4d4d',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
});
