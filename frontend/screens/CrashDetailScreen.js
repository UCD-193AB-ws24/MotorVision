import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useState } from 'react';
import { Image } from 'react-native';


export default function CrashDetailScreen({ route, navigation }) {
  const [trajectoryImage, setTrajectoryImage] = useState("");
  const { crash } = route.params;
  const fetchTrajectoryImage = async () => {
    console.log('Fetching trajectory image...');
    const url = 'http://127.0.0.1:8000/traj_image/';
    try {
      const response = await axios.get(url);
      console.log('Response:', response.data);
      let base64 = response.data.image_data;
      console.log('Base64:', base64);
      let imageUrl = `data:image/png;base64,${base64}`;
      setTrajectoryImage(imageUrl);
      return response.data; // Return the data for further use
    } catch (error) {
      console.error('Error fetching trajectory image:', error);
      return null; // Return null in case of an error
    }

  };

  return (
    <LinearGradient
      colors={['#121212', '#1E1E1E', '#292929']} // Gradient effect
      style={styles.container}
    >
      <Text style={styles.title}>Crash Details</Text>

      <View style={styles.detailBox}>
        <Text style={styles.info}>🕒 Time: {crash.timestamp}</Text>
        <Text style={styles.info}>⚠️ Details: {crash.details}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={fetchTrajectoryImage}
      >
        <Text style={styles.buttonText}>Back to Crash Logs</Text>
      </TouchableOpacity>

      {trajectoryImage !== "" && (
        <Image source={{ uri: trajectoryImage }} style={styles.image} />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailBox: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#00bfff',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  info: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#00bfff',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#00bfff',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});