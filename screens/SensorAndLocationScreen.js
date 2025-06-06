import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function SensorAndLocationScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://3.147.83.156:8000/connect/');
      setIsConnected(true);
      Alert.alert('Connected', res.data.message || 'Helmet connected successfully.');
    } catch (err) {
      console.error('[Helmet Connect]', err.message);
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Sensor & Location Settings</Text>

      <View style={styles.statusRow}>
        <Ionicons
          name={isConnected ? 'checkmark-circle' : 'alert-circle'}
          size={22}
          color={isConnected ? '#0f0' : '#f44'}
        />
        <Text style={styles.statusText}>
          {isConnected ? 'Helmet Connected' : 'Helmet Not Connected'}
        </Text>
      </View>

      <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
        <Text style={styles.buttonText}>
          {loading ? 'Connecting...' : isConnected ? 'Reconnect Helmet' : 'Connect Helmet'}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.note}>
        <Text style={styles.noteText}>
          Location and sensor services must be enabled for crash detection, speed tracking, and helmet pairing.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    color: '#ddd',
    fontSize: 16,
    marginLeft: 10,
  },
  connectButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4d4d',
    marginTop: 8,
  },
  note: {
    marginTop: 20,
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 10,
  },
  noteText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
});
