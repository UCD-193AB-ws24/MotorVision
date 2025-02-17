import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CrashLogsScreen({ navigation }) {
  const [crashLogs, setCrashLogs] = useState([
    { id: '1', timestamp: 'Feb 12, 2025, 10:30 AM', details: 'Crash detected at 30 mph' },
    { id: '2', timestamp: 'Feb 11, 2025, 3:15 PM', details: 'Minor impact detected' },
  ]);

  return (
    <LinearGradient
      colors={['#121212', '#1E1E1E', '#292929']} // Gradient to match Figma design
      style={styles.container}
    >
      <Text style={styles.title}>Crash Reports</Text>

      <FlatList
        data={crashLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.logItem}
            onPress={() => navigation.navigate('CrashDetail', { crash: item })}
          >
            <Text style={styles.logText}>{item.timestamp}</Text>
            <Text style={styles.logDetails}>{item.details}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CrashRecording')}
      >
        <Text style={styles.buttonText}>Back to Recording</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  logItem: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#00bfff',
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  logText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  logDetails: {
    fontSize: 14,
    color: '#bbb',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#00bfff',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#00bfff',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
