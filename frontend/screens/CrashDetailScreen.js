import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';


export default function CrashDetailScreen({ route, navigation }) {
  const [trajectoryImage, setTrajectoryImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);

  const { crash } = route.params;


  {/*const fetchTrajectoryImage = async () => {
    setIsLoading(true);
    console.log('Fetching trajectory image...');
    const url = 'http://127.0.0.1:8000/traj_image/';
    try {
      const response = await axios.get(url);
      let base64 = response.data.image_data;
      let imageUrl = `data:image/png;base64,${base64}`;
      setTrajectoryImage(imageUrl);
      setIsImageVisible(true);
    } catch (error) {
      console.error('Error fetching trajectory image:', error);
    } finally {
      setIsLoading(false);
    }
  }; */}

  const fetchTrajectoryImage = async (locations) => {
    setIsLoading(true);
    console.log("Sending locations to backend for image generation in details screen", locations);
    const url = `http://3.147.83.156:8000/traj_image_live/`;
    try {
      const response = await axios.post(url, { locations});
      console.log("Server response for image generation in details screen", response.data);
      let base64 = response.data.image_data;
      let imageUrl = `data:image/png;base64,${base64}`;
      setTrajectoryImage(imageUrl);
      setIsImageVisible(true);
      // setServerResponse(response.data);
    } catch (error) {
      console.error("Error sending location for image generation in details screen:", error);
      // setServerResponse("Error sending location for image generation in details screen");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#121212', '#1E1E1E', '#292929']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#00bfff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Crash Details</Text>

        {/* Details */}
        <View style={styles.detailBox}>
          <Text style={styles.info}>🕒 Time: {crash.timestamp}</Text>
          <Text style={styles.info}>⚠️ Details: {crash.details}</Text>
        </View>

        
        {/* Load Image Button */}
        {!trajectoryImage && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => fetchTrajectoryImage(crash.location)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>SHOW IMAGE</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Toggle Image Button */}
        {trajectoryImage ? (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.toggleButton]} 
              onPress={() => setIsImageVisible(!isImageVisible)}
            >
              <Text style={styles.buttonText}>
                {isImageVisible ? "HIDE IMAGE" : "SHOW IMAGE"}
              </Text>
            </TouchableOpacity>

            {isImageVisible && (
              <Image 
                source={{ uri: trajectoryImage }} 
                style={styles.image} 
                resizeMode="contain" 
              />
            )}
          </>
        ) : (
          <Text style={styles.noImageText}>No image loaded yet.</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 40, // Reduced top padding to align closer to the top
    paddingBottom: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, // Closer to the top
  },
  backText: {
    fontSize: 18,
    color: '#00bfff',
    marginLeft: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'left',
  },
  detailBox: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#00bfff',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    marginBottom: 15,
  },
  info: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#00bfff',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#00bfff',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  toggleButton: {
    backgroundColor: '#444',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#555',
  },
  noImageText: {
    fontSize: 16,
    color: '#bbb',
    marginTop: 20,
    textAlign: 'center',
  },
});
