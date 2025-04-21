import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const instructions = [
  { id: '1', text: "1. Open Bluetooth settings on your phone." },
  { id: '2', text: "2. Turn on your SmartHelmet." },
  { id: '3', text: "3. Look for 'HC-05' in available devices." },
  { id: '4', text: "4. Tap to pair the device and enter the password if prompted." },
  { id: '5', text: "5. Once paired, open the app to connect." },
];

export default function PairingGuideScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>How to Pair a Device</Text>

      {/* Instruction List */}
      <FlatList
        data={instructions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.instructionItem}>
            <Text style={styles.instructionText}>{item.text}</Text>
          </View>
        )}
      />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionItem: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
