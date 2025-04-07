import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

export default function CrashDetailScreen({ route, navigation }) {
  const [trajectoryImage, setTrajectoryImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);

  const { crash, locations } = route.params;

  const fetchTrajectoryImage = async () => {
    setIsLoading(true);
    const url = 'http://3.147.83.156:8000/traj_image_live/';

    const payload = (Array.isArray(locations) && locations.length > 0
      ? locations
      : [{
          latitude: Number(crash.location?.latitude),
          longitude: Number(crash.location?.longitude),
          timestamp: new Date(crash.timestamp || crash.time || new Date()).toISOString(),
        }]
    ).map(loc => ({
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      timestamp: String(loc.timestamp),
    }));
  

    try {
      const response = await axios.post(url, { locations: payload });
      const base64 = response.data.image_data;
      const imageUrl = `data:image/png;base64,${base64}`;
      setTrajectoryImage(imageUrl);
      setIsImageVisible(true);
    } catch (error) {
      console.error('Error fetching trajectory image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatSpeed = (speed) => {
    return typeof speed === 'number' ? `${(speed * 2.237).toFixed(1)} mph` : 'N/A';
  };

  const formatAccel = (accel) => {
    return typeof accel === 'number' ? `${accel.toFixed(2)} m/s²` : 'N/A';
  };

  const formatLocation = (loc) => {
    return loc ? `${loc.latitude}, ${loc.longitude}` : 'Not available';
  };

  const formatTime = (time) => {
    if (!time) return 'Unknown';
    const date = new Date(time);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} color="#0A84FF" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.header}>Crash Details</Text>

      {/* Info Box */}
      <View style={styles.detailBox}>
        <Text style={styles.detailLabel}>Time:</Text>
        <Text style={styles.detailValue}>{formatTime(crash.timestamp || crash.time)}</Text>

        <Text style={styles.detailLabel}>Speed:</Text>
        <Text style={styles.detailValue}>{formatSpeed(crash.speed)}</Text>

        <Text style={styles.detailLabel}>Acceleration:</Text>
        <Text style={styles.detailValue}>{formatAccel(crash.acceleration)}</Text>

        <Text style={styles.detailLabel}>Location:</Text>
        <Text style={styles.detailValue}>{formatLocation(crash.location)}</Text>
      </View>

      {/* Load Image Button */}
      {!trajectoryImage && (
        <TouchableOpacity
          style={styles.button}
          onPress={fetchTrajectoryImage} // FIXED: correctly calling the function
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Load Crash Image</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Toggle Image + Preview */}
      {trajectoryImage && (
        <>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsImageVisible(!isImageVisible)}
          >
            <Text style={styles.buttonText}>
              {isImageVisible ? 'Hide Image' : 'Show Image'}
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
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backText: {
    fontSize: 18,
    color: '#0A84FF',
    marginLeft: 5,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'left',
  },
  detailBox: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  toggleButton: {
    backgroundColor: '#444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 250,
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#555',
  },
});
