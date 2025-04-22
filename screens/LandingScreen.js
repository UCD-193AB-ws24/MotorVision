// screens/LandingScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LandingScreen({ navigation }) {
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    if (name.trim()) {
      await AsyncStorage.setItem('userInfo', JSON.stringify({ name }));
      navigation.replace('MainTabs');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to MotorVision</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  title: { color: 'white', fontSize: 24, marginBottom: 20 },
  input: {
    width: '80%',
    backgroundColor: '#1E1E1E',
    color: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
