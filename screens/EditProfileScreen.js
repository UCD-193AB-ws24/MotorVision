import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useProfileStore } from '../store/profileStore';
import { Ionicons } from '@expo/vector-icons';

const hydrateProfile = async (setProfile) => {
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
  }
};

const deletePreviousImage = async (url) => {
  if (!url) return;

  try {
    const storage = getStorage();
    const decodedUrl = decodeURIComponent(url.split('?')[0]);
    const parts = decodedUrl.split('/o/');
    if (parts.length < 2) {
      console.warn('Could not parse storage path from URL:', url);
      return;
    }
    const filePath = parts[1];
    const prevRef = ref(storage, filePath);
    await deleteObject(prevRef);
    console.log('Previous image deleted successfully');
  } catch (error) {
    console.warn('Could not delete previous image:', error);
  }
};

const updateProfile = async (profileData, createdAt) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await updateDoc(doc(db, 'users', user.uid), profileData);
    await AsyncStorage.setItem('userInfo', JSON.stringify({
      name: profileData.name || '',
      createdAt: createdAt ? new Date(createdAt).getTime() / 1000 : '',
    }));
  } catch (err) {
    console.error('[Profile Update] Failed:', err);
    throw err;
  }
};

export default function EditProfileScreen({ navigation }) {
  const setProfileImageGlobal = useProfileStore((state) => state.setProfileImage);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    profileImage: '',
    createdAt: '',
    totalRides: 0,
    totalDistance: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await hydrateProfile(setProfile);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    const { name, bio, profileImage, createdAt } = profile;
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }

    try {
      await updateProfile({ name, bio, profileImage }, createdAt);
      setProfileImageGlobal(profileImage);
      Alert.alert('Saved', 'Profile updated successfully.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save changes.');
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;

      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storage = getStorage();
        const user = auth.currentUser;

        if (profile.profileImage) {
          await deletePreviousImage(profile.profileImage);
        }

        const imageRef = ref(storage, `profile_images/${user.uid}_${Date.now()}.jpg`);
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);

        setProfile((prev) => ({ ...prev, profileImage: downloadURL }));
      } catch (error) {
        console.error('[Image Upload] Error:', error);
        Alert.alert('Upload Failed', 'Unable to upload profile image.');
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Edit Profile</Text>

      <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
        {profile.profileImage ? (
          <Image source={{ uri: profile.profileImage }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={32} color="#888" />
            <Text style={styles.placeholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Full Name */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={(text) => setProfile((prev) => ({ ...prev, name: text }))}
          placeholder="Your name"
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Bio */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={profile.bio}
          onChangeText={(text) => setProfile((prev) => ({ ...prev, bio: text }))}
          placeholder="Write a short bio..."
          placeholderTextColor="#aaa"
        />
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
        <Text style={styles.stat}>{profile.email}</Text>

        <Text style={styles.sectionTitle}>Joined</Text>
        <Text style={styles.stat}>{profile.createdAt || '—'}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
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
  imageContainer: { alignSelf: 'center', marginBottom: 20 },
  image: { width: 100, height: 100, borderRadius: 50 },
  placeholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: '#888', fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  stat: { fontSize: 16, color: '#ccc', marginBottom: 6 },
  input: {
    backgroundColor: '#2C2C2E',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0A84FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});
