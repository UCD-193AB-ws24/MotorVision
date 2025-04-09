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
import { useNavigation } from '@react-navigation/native';

export default function TripHistoryScreen() {
  const trips = useBluetoothStore((state) => state.tripLogs);
  const loadTripLogs = useBluetoothStore((state) => state.loadTripLogs);
  const deleteTrip = useBluetoothStore((state) => state.deleteTrip);
  const navigation = useNavigation();

  useEffect(() => {
    loadTripLogs(); // ✅ Load trips on mount
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
    return (distance / 1609).toFixed(2) + ' mi'; // Convert meters to miles
  };

  const formatSpeed = (speed) => {
    return (speed * 2.237).toFixed(1) + ' mph'; // Convert m/s to mph
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
      {/* Delete Button */}
      <TouchableOpacity onPress={() => deleteTrip(index)}>
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
  },
  deleteIcon: {
    padding: 8,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
});
