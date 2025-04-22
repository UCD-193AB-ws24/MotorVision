// screens/EditProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useBluetoothStore } from '../store/bluetoothStore';

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const tripLogs = useBluetoothStore(state => state.tripLogs);

  useEffect(() => {
    const fetchProfile = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setName(data.name || '');
            setEmail(data.email || '');
            setBio(data.bio || '');
            setCreatedAt(new Date(data.createdAt.seconds * 1000).toLocaleDateString());
            await AsyncStorage.setItem('userInfo', JSON.stringify({ name: data.name }));
          }
        }
      });
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), { name, bio });
      await AsyncStorage.setItem('userInfo', JSON.stringify({ name }));
      Alert.alert('Saved', 'Profile updated successfully.');
      navigation.goBack();
    } catch (err) {
      console.error('Error saving:', err);
      Alert.alert('Error', 'Failed to save changes.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out!');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const totalDistanceMi = (tripLogs.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0) / 1609).toFixed(2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Your Profile</Text>

      {/* Card: Basic Info */}
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{email}</Text>

        <Text style={styles.label}>Joined</Text>
        <Text style={styles.value}>{createdAt}</Text>
      </View>

      {/* Card: Editable Info */}
      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="#aaa"
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={bio}
          onChangeText={setBio}
          placeholder="Write a short bio..."
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Card: Ride Stats */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ride Stats</Text>
        <Text style={styles.stat}>Total Trips: {tripLogs.length}</Text>
        <Text style={styles.stat}>Total Distance: {totalDistanceMi} mi</Text>
        <Text style={styles.stat}>Crashes Recorded: {/* Placeholder */}</Text>
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonOutline} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  contentContainer: { padding: 20, paddingBottom: 40 },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    color: '#bbb',
    fontSize: 15,
    marginBottom: 4,
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#2C2C2E',
    color: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  stat: {
    fontSize: 15,
    color: '#ccc',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#0A84FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonOutline: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0A84FF',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
