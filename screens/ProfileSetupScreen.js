import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileSetupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your media library to upload a photo.');
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
        const imageRef = ref(storage, `profile_images/${auth.currentUser.uid}_${Date.now()}.jpg`);
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);

        setProfileImage(downloadURL);
      } catch (err) {
        console.error('Image upload failed:', err);
        Alert.alert('Upload Failed', 'Unable to upload photo.');
      }
    }
  };

  const handleContinue = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!name.trim()) {
      Alert.alert('Missing Info', 'Please enter your name.');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name,
        bio,
        profileImage,
      });

      await AsyncStorage.setItem('userInfo', JSON.stringify({
        name,
        createdAt: Math.floor(Date.now() / 1000),
      }));

      navigation.replace('MainTabs');
    } catch (err) {
      console.error('Failed to save profile:', err);
      Alert.alert('Error', 'Could not save your info.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Set Up Your Profile</Text>

        <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={36} color="#999" />
              <Text style={styles.placeholderText}>Optional Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Full Name (required)"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Short Bio (optional)"
          placeholderTextColor="#aaa"
          multiline
          value={bio}
          onChangeText={setBio}
        />

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  imagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 6,
    color: '#888',
    fontSize: 12,
  },
  input: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0A84FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
