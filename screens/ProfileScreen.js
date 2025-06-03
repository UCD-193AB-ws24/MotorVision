import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBluetoothStore } from '../store/bluetoothStore';
import { useProfileStore } from '../store/profileStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfileScreen({ navigation }) {
  const tripLogs = useBluetoothStore((state) => state.tripLogs);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    profileImage: '',
    createdAt: '',
  });

  const hydrateProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          name: data.name || '',
          email: data.email || user.email || '',
          bio: data.bio || '',
          profileImage: data.profileImage || '',
          createdAt: data.createdAt?.seconds
            ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
            : '',
        });

        await AsyncStorage.setItem('userInfo', JSON.stringify({
          name: data.name || '',
          createdAt: data.createdAt?.seconds || '',
        }));
      }
    } catch (err) {
      console.error('[Profile Hydration] Failed:', err);
      Alert.alert('Error', 'Failed to load profile.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        const user = auth.currentUser;
        if (user) {
          const cached = await AsyncStorage.getItem('userInfo');
          if (cached) {
            const { name, createdAt: cachedCreatedAt } = JSON.parse(cached);
            setProfile((prev) => ({
              ...prev,
              name: name || '',
              createdAt: cachedCreatedAt
                ? new Date(cachedCreatedAt * 1000).toLocaleDateString()
                : '',
            }));
          }

          await hydrateProfile();
        }
      };

      loadProfile();
    }, [])
  );

  const totalDistanceMi = (
    tripLogs.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0) / 1609
  ).toFixed(2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.header}>Profile</Text>

      {/* Profile Image */}
      <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
        {profile.profileImage ? (
          <Image source={{ uri: profile.profileImage }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="person-circle-outline" size={100} color="#555" />
          </View>
        )}
      </TouchableOpacity>

      {/* Name & Bio */}
      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <Text style={styles.value}>{profile.name || '—'}</Text>

        <Text style={styles.label}>Bio</Text>
        <Text style={styles.value}>{profile.bio || '—'}</Text>
      </View>

      {/* Ride Stats */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ride Stats</Text>
        <Text style={styles.stat}>Total Trips: {tripLogs.length}</Text>
        <Text style={styles.stat}>Total Distance: {totalDistanceMi} mi</Text>
      </View>

      {/* Email & Join Date */}
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{profile.email || '—'}</Text>

        <Text style={styles.label}>Joined</Text>
        <Text style={styles.value}>{profile.createdAt || '—'}</Text>
      </View>

      {/* Edit button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Ionicons name="create-outline" size={18} color="#fff" />
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  contentContainer: { padding: 20, paddingBottom: 40 },
  backButton: { marginBottom: 10 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 20, textAlign: 'center' },
  image: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 20 },
  imagePlaceholder: { alignSelf: 'center', marginBottom: 20 },
  card: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 20, marginBottom: 20 },
  label: { fontSize: 16, color: '#bbb', marginBottom: 4 },
  value: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  stat: { fontSize: 16, color: '#ccc', marginBottom: 6 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 20,
  },
  editText: { fontSize: 16, color: '#fff', marginLeft: 8 },
});
