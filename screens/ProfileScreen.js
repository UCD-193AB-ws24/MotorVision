import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from './ThemeCustomization';

import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfileScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    profileImage: '',
    createdAt: '',
    totalRides: 0,
    totalDistance: 0,
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
          totalRides: data.stats?.totalRides || 0,
          totalDistance: parseFloat((data.stats?.totalDistanceMiles || 0).toFixed(1)),
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

      {/* Full Name */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Name</Text>
        <Text style={styles.stat}>{profile.name || '—'}</Text>
      </View>

      {/* Bio */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <Text style={styles.stat}>{profile.bio || '—'}</Text>
      </View>

      {/* Ride Stats */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ride Stats</Text>
        <Text style={styles.stat}>Total Trips: {profile.totalRides}</Text>
        <Text style={styles.stat}>Total Distance: {profile.totalDistance} mi</Text>
      </View>

      {/* Email & Join Date */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Email</Text>
        <Text style={styles.stat}>{profile.email || '—'}</Text>

        <Text style={styles.sectionTitle}>Joined</Text>
        <Text style={styles.stat}>{profile.createdAt || '—'}</Text>
      </View>

      {/* Edit button */}
      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: theme.accent }]}
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  stat: { fontSize: 16, color: '#ccc', marginBottom: 6 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A84FF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 20,
  },
  editText: { fontSize: 16, color: '#fff', marginLeft: 8, fontWeight: 'bold'},
});
