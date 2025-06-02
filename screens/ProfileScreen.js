import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBluetoothStore } from '../store/bluetoothStore';
import { useProfileStore } from '../store/profileStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen({ navigation }) {
  const name = useProfileStore((state) => state.name);
  const email = useProfileStore((state) => state.email);
  const profileImage = useProfileStore((state) => state.profileImage);
  const createdAt = useProfileStore((state) => state.createdAt);
  const hydrateProfile = useProfileStore((state) => state.hydrateProfile);
  const tripLogs = useBluetoothStore((state) => state.tripLogs);

  const [joinDate, setJoinDate] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          await hydrateProfile();

          if (createdAt?.seconds) {
            setJoinDate(new Date(createdAt.seconds * 1000).toLocaleDateString());
          } else {
            const cached = await AsyncStorage.getItem('userInfo');
            if (cached) {
              const { createdAt: cachedCreatedAt } = JSON.parse(cached);
              if (cachedCreatedAt) {
                setJoinDate(new Date(cachedCreatedAt * 1000).toLocaleDateString());
              }
            }
          }
        } catch (err) {
          console.error('[ProfileScreen] Hydration fallback error:', err);
        }
      };

      loadProfile();
    }, [createdAt])
  );

  const totalDistanceMi = (
    tripLogs.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0) / 1609
  ).toFixed(2);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="person-circle-outline" size={100} color="#555" />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{name}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{email}</Text>

        <Text style={styles.label}>Joined</Text>
        <Text style={styles.value}>{joinDate || '—'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ride Stats</Text>
        <Text style={styles.stat}>Total Trips: {tripLogs.length}</Text>
        <Text style={styles.stat}>Total Distance: {totalDistanceMi} mi</Text>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Ionicons name="create-outline" size={18} color="#fff" />
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
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
  },
  editText: { fontSize: 16, color: '#fff', marginLeft: 8 },
});
