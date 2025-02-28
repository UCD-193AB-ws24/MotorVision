import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CrashRecordingScreen({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <LinearGradient
      colors={['#121212', '#1E1E1E', '#292929']} // Adjust colors to match your Figma
      style={styles.container}
    >
      <Text style={styles.title}>MotorVision</Text>
      <Text style={styles.status}>
        {isRecording ? 'Recording Crash Data...' : 'Tap to Start Recording'}
      </Text>

      <TouchableOpacity
        style={[styles.button, isRecording ? styles.buttonActive : styles.buttonInactive]}
        onPress={toggleRecording}
      >
        <Text style={styles.buttonText}>{isRecording ? 'Stop' : 'Start'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('CrashLogs')}
      >
        <Text style={styles.linkText}>View Crash Reports</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 30,
  },
  button: {
    width: 180,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  buttonActive: {
    backgroundColor: 'red',
    shadowColor: 'red',
  },
  buttonInactive: {
    backgroundColor: '#00bfff',
    shadowColor: '#00bfff',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
    color: '#00bfff',
    textDecorationLine: 'underline',
  },
});
