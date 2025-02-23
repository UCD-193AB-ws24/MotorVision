// used AI resources/generation for code

import { View, Button, Easing, Text, ScrollView, Animated, Image, StyleSheet, Platform, PermissionsAndroid, ActivityIndicator, StatusBar } from 'react-native';
import { ThemedText, ThemedView } from '@react-navigation/native';


// import { ThemedText } from '@/components/ThemedText';
// import { ThemedView } from '@/components/ThemedView';
import React, { useEffect, useRef, useState } from "react";
import Geolocation from "react-native-geolocation-service";



// rotating image component
function RotatingImageComponent({ isRotating, stopRotation }) {
  const rotateValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    let animation;
    if (isRotating) {
      animation = Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 40000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      if (animation) {
        animation.stop();
      }
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isRotating]);

  const rotateInterpolation = rotateValue.interpolate({
    inputRange: [0, 0.25],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={{ alignItems: "center", gap: 10 }}>
      <Animated.Image
        source={require("../assets/Car.svg")}
        style={{ width: 100, height: 100, transform: [{perspective: 800}, { rotateY: rotateInterpolation }] }}
      />
            <Button title={isRotating ? 'Choose SmartHelmet?' : 'SmartHelmet Chosen!'} onPress={stopRotation} />
    </View>
  );
}

function RotatingImage() {
  const [isRotating, setIsRotating] = useState(true);

  const stopRotation = () => setIsRotating(false);

  return <RotatingImageComponent isRotating={isRotating} stopRotation={stopRotation} />;
}


// live location function -> need to establish connectivity
/*
const LocationView = () => {
    const [location, setLocation] = useState<{
      latitude: number;
      longitude: number;
      accuracy: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const requestPermissionAndGetLocation = async () => {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
              setError("Location permission denied");
              setLoading(false);
              return;
            }

            Geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: parseFloat(position.coords.latitude.toFixed(2)),
                        longitude: parseFloat(position.coords.longitude.toFixed(2)),
                        accuracy: position.coords.accuracy,
                    });
                    setLoading(false);
                },
                (error) => {
                    setError(error.message);
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        };

        requestPermissionAndGetLocation();
    }, []);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true; // iOS handles permissions in Info.plist
    };

    return (
        <View style={{ padding: 20, alignItems: 'center' }}>
            {loading && <ActivityIndicator size="large" />}
            {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}
            {location ? (
                <View>
                    <ThemedText style={styles.bodyText}> 🌍 {location.latitude}°, {location.longitude}°</ThemedText>
                </View>
            ) : (
                !loading && <Text>No location data available.</Text>
            )}
        </View>
    );
}; */

export default function HomeScreen() {
  return (
    <ScrollView style={styles.scrollView}>
    <ThemedView style={styles.titleContainer}>
      <ThemedText style={styles.titleText}>MotorVision</ThemedText>
    </ThemedView>
    <ThemedView style={styles.stepContainer}>
    </ThemedView>
    <ThemedView style={styles.helmetContainer}>
      <ThemedText style={styles.connectText}>Connect to a Device</ThemedText>
    </ThemedView>
    <ThemedView style={styles.helmetContainer}>
      <RotatingImage />
    </ThemedView>
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  application: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  titleContainer: {
    marginTop: 100,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    backgroundColor: 'transparent',
  },
  titleText: {
    fontSize: 60,  
    fontWeight: 'bold', 
    textAlign: 'center',  
    color: 'white',  
  },
  stepContainer: {
    marginTop: 5,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: "bold",
    justifyContent: "center",
    backgroundColor: 'transparent',
  },
  deviceContainer: {
    marginTop: 30,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: "bold",
    justifyContent: "center",
    backgroundColor: 'transparent',
  },
  helmetContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: "center",
    backgroundColor: 'transparent',

  },
  bodyContainer: {
    marginTop: 5,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    backgroundColor: 'transparent',

  },
  connectText: {
    fontSize: 30,  
    fontWeight: 'bold', 
    textAlign: 'center',  
    color: 'white',  
  },
  bodyText: {
    fontSize: 20,  
    textAlign: 'center',  
    color: 'white',  
  },
  helmetImage: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  linearContainer: {
    flex: 1, // Full screen height
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    color: 'white',
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageContainer: {
    marginTop: 150, 
    marginBottom: 150,
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#121212", 
    padding: 20,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  button: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
  },
  
});
