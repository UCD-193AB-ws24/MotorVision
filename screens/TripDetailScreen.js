import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function TripDetailScreen({ navigation }) {
  const route = useRoute();
  const { trip } = route.params;

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

  const renderCrash = ({ item, index }) => (
    <TouchableOpacity
      style={styles.crashItem}
      onPress={() =>
        navigation.navigate("CrashDetail", {
          crash: item,
          locations: trip.crashEvents.map(c => ({
            latitude: c.location?.latitude,
            longitude: c.location?.longitude,
            timestamp: c.timestamp || c.time || new Date().toISOString()
          }))
        })
      }
    >
      <Text style={styles.crashDetail}>
        <Text style={styles.crashLabel}>Crash Time: </Text>
        {formatDateTime(item.time)}
      </Text>
      <Text style={styles.crashDetail}>
        <Text style={styles.crashLabel}>Speed at Crash: </Text>
        {formatSpeed(item.speed)}
      </Text>
      <Text style={styles.crashDetail}>
        <Text style={styles.crashLabel}>Acceleration: </Text>
        {item.acceleration !== undefined && item.acceleration !== null
          ? `${parseFloat(item.acceleration).toFixed(2)} m/s²`
          : 'N/A'}
      </Text>
      {item.location ? (
        <Text style={styles.crashDetail}>
          <Text style={styles.crashLabel}>Location: </Text>
          {`${item.location.latitude}, ${item.location.longitude}`}
        </Text>
      ) : (
        <Text style={styles.crashDetail}>
          <Text style={styles.crashLabel}>Location: </Text>
          Not available
        </Text>
      )}
    </TouchableOpacity>
  );  

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>Trip Details</Text>

      {/* Trip Stats */}
      <View style={styles.detailBox}>
        <Text style={styles.detailLabel}>Start Time:</Text>
        <Text style={styles.detailValue}>
          {formatDateTime(trip.startTime)}
        </Text>

        <Text style={styles.detailLabel}>End Time:</Text>
        <Text style={styles.detailValue}>
          {formatDateTime(trip.endTime)}
        </Text>

        <Text style={styles.detailLabel}>Duration:</Text>
        <Text style={styles.detailValue}>
          {formatDuration(trip.startTime, trip.endTime)}
        </Text>

        <Text style={styles.detailLabel}>Distance:</Text>
        <Text style={styles.detailValue}>
          {formatDistance(trip.totalDistance)}
        </Text>

        <Text style={styles.detailLabel}>Average Speed:</Text>
        <Text style={styles.detailValue}>
          {formatSpeed(trip.averageSpeed)}
        </Text>

        <Text style={styles.detailLabel}>Max Speed:</Text>
        <Text style={styles.detailValue}>
          {formatSpeed(trip.maxSpeed)}
        </Text>
      </View>

      {/* Crash Info */}
      {trip.crashEvents?.length > 0 ? (
        <>
          <Text style={styles.sectionHeader}>Crash Info</Text>
          <FlatList
            data={trip.crashEvents}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderCrash}
            scrollEnabled={false}
          />
        </>
      ) : (
        <Text style={styles.noCrashesText}>
          No crashes detected during this trip.
        </Text>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to History</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailBox: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  crashItem: {
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  crashDetail: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 4,
  },
  crashLabel: {
    fontWeight: 'bold',
    color: '#fff',
  },
  noCrashesText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
