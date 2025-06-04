import React, { useState, useMemo, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useBluetoothStore } from '../store/bluetoothStore';
import { ThemeContext } from './ThemeCustomization';


export default function CrashDetailScreen({ route, navigation }) {
  const { theme } = useContext(ThemeContext);
  const [trajectoryImage, setTrajectoryImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);

  const getLastCrashBuffer = useBluetoothStore((state) => state.getLastCrashBuffer);
  const { crash, locations } = route.params;

  const buffer = getLastCrashBuffer();
  const crashTime = useMemo(() => new Date(crash.timestamp || crash.time).getTime(), [crash]);

  const lastEntry = buffer?.[buffer.length - 1];
  const isRecent = useMemo(() => {
    const lastTimestamp = lastEntry?.timestamp;
    return lastTimestamp && Math.abs(lastTimestamp - crashTime) < 15000;
  }, [lastEntry, crashTime]);

  const formatTime = (time) => {
    if (!time) return 'Unknown';
    const date = new Date(time);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatSpeed = (speed) =>
    typeof speed === 'number' ? `${(speed * 2.237).toFixed(1)} mph` : 'N/A';

  const formatAccel = (accel) =>
    typeof accel === 'number' ? `${accel.toFixed(2)} m/s²` : 'N/A';

  const formatLocation = (loc) =>
    loc?.latitude && loc?.longitude ? `${loc.latitude}, ${loc.longitude}` : 'Not available';

  const fetchTrajectoryImage = async () => {
    setIsLoading(true);
    const url = 'http://3.147.83.156:8000/traj_image_live/';

    const payload = (locations?.length > 0 ? locations : [{
      latitude: Number(crash.location?.latitude),
      longitude: Number(crash.location?.longitude),
      timestamp: new Date(crash.timestamp || crash.time || new Date()).toISOString(),
    }]).map(loc => ({
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      timestamp: String(loc.timestamp),
    }));

    try {
      const response = await axios.post(url, { locations: payload });
      const base64 = response.data?.image_data;
      if (base64) {
        setTrajectoryImage(`data:image/png;base64,${base64}`);
        setIsImageVisible(true);
      } else {
        Alert.alert('No image returned');
      }
    } catch (error) {
      console.error('Error fetching trajectory image:', error);
      Alert.alert('Error', 'Failed to load trajectory image.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportCrashBuffer = async () => {
    try {
      if (!buffer || buffer.length === 0) {
        Alert.alert('No buffer data', 'No crash buffer available to export.');
        return;
      }

      const headers = [
        'timestamp',
        'accel_x', 'accel_y', 'accel_z', 'accel_mag',
        'gyro_x', 'gyro_y', 'gyro_z',
        'vel_x', 'vel_y', 'vel_z',
        'roll', 'pitch', 'yaw',
        'lat', 'long',
      ].join(',');

      const csvRows = buffer.map(entry => {
        const {
          timestamp,
          acceleration = {},
          gyroscope = {},
          velocity = {},
          orientation = {},
          location = {},
        } = entry;

        return [
          timestamp,
          acceleration.x ?? '', acceleration.y ?? '', acceleration.z ?? '', acceleration.magnitude ?? '',
          gyroscope.x ?? '', gyroscope.y ?? '', gyroscope.z ?? '',
          velocity.x ?? '', velocity.y ?? '', velocity.z ?? '',
          orientation.roll ?? '', orientation.pitch ?? '', orientation.yaw ?? '',
          location.latitude ?? '', location.longitude ?? '',
        ].join(',');
      });

      const content = `${headers}\n${csvRows.join('\n')}`;
      const path = `${FileSystem.documentDirectory}crash_buffer_${Date.now()}.csv`;

      await FileSystem.writeAsStringAsync(path, content);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Crash Buffer',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert('Export Complete', `File saved to: ${path}`);
      }
    } catch (err) {
      console.error('Export error:', err);
      Alert.alert('Export Failed', 'Could not export crash buffer.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} color="#0A84FF" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Crash Details</Text>

      <View style={styles.detailBox}>
        <Text style={styles.detailLabel}>Time:</Text>
        <Text style={styles.detailValue}>{formatTime(crash.timestamp || crash.time)}</Text>

        <Text style={styles.detailLabel}>Speed:</Text>
        <Text style={styles.detailValue}>{formatSpeed(crash.speed)}</Text>

        <Text style={styles.detailLabel}>Acceleration:</Text>
        <Text style={styles.detailValue}>{formatAccel(crash.acceleration)}</Text>

        <Text style={styles.detailLabel}>Location:</Text>
        <Text style={styles.detailValue}>{formatLocation(crash.location)}</Text>
      </View>

      {isRecent && (
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={exportCrashBuffer}>
          <Text style={styles.buttonText}>Export Crash Buffer</Text>
        </TouchableOpacity>
      )}

      {!trajectoryImage && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.accent }]}
          onPress={fetchTrajectoryImage}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Load Crash Image</Text>
          )}
        </TouchableOpacity>
      )}

      {trajectoryImage && (
        <>
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: theme.accent }]}
            onPress={() => setIsImageVisible(!isImageVisible)}
          >
            <Text style={styles.buttonText}>
              {isImageVisible ? 'Hide Image' : 'Show Image'}
            </Text>
          </TouchableOpacity>

          {isImageVisible && (
            <Image
              source={{ uri: trajectoryImage }}
              style={styles.image}
              resizeMode="contain"
            />
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  contentContainer: { padding: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backText: { fontSize: 18, color: '#0A84FF', marginLeft: 5 },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'left',
  },
  detailBox: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailLabel: { fontSize: 16, color: '#bbb', marginBottom: 4 },
  detailValue: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  toggleButton: {
    backgroundColor: '#444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  image: {
    width: '100%',
    height: 250,
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#555',
  },
});
