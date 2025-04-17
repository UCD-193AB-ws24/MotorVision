// screens/EditProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase'; // Adjust the import path as necessary
import { onAuthStateChanged } from 'firebase/auth';

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out!');
      // Navigate to login screen if using navigation
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  useEffect(() => {
    const loadUserInfo = async () => {
      const stored = await AsyncStorage.getItem('userInfo');
      if (stored) {
        const { name } = JSON.parse(stored);
        setName(name);
      }
    };
    loadUserInfo();
  }, []);

  const handleSave = async () => {
    if (name.trim()) {
      await AsyncStorage.setItem('userInfo', JSON.stringify({ name }));
      Alert.alert('Saved', 'Your name has been updated.');
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonNoBackground} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 20 },
  title: { color: 'white', fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: {
    backgroundColor: '#1E1E1E',
    color: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonNoBackground: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
