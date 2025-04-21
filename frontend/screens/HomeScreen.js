import { 
  View, 
  Button, 
  Easing, 
  Text, 
  ScrollView, 
  Animated, 
  Image, 
  StyleSheet, 
  Platform, 
  PermissionsAndroid, 
  ActivityIndicator, 
  StatusBar 
} from "react-native";

// AI Generation used to resolve syntax issues, and to develop template for script.
import React, { useEffect, useRef, useState } from "react";
// import Geolocation from "react-native-geolocation-service";

// Rotating image component
function RotatingImageComponent({ isRotating, stopRotation }) {
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
        source={require("../assets/Car.png")} // Changed from SVG to PNG (React Native doesn't support require() for SVGs)
        style={{ width: 100, height: 100, transform: [{ perspective: 800 }, { rotateY: rotateInterpolation }] }}
      />
      <Button title={isRotating ? "Choose SmartHelmet?" : "SmartHelmet Chosen!"} onPress={stopRotation} />
    </View>
  );
}

function RotatingImage() {
  const [isRotating, setIsRotating] = useState(true);

  const stopRotation = () => setIsRotating(false);

  return <RotatingImageComponent isRotating={isRotating} stopRotation={stopRotation} />;
}

// Location Component
function LocationView() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   const requestPermissionAndGetLocation = async () => {
  //     const hasPermission = await requestLocationPermission();
  //     if (!hasPermission) {
  //       setError("Location permission denied");
  //       setLoading(false);
  //       return;
  //     }

    //   Geolocation.getCurrentPosition(
    //     (position) => {
    //       setLocation({
    //         latitude: parseFloat(position.coords.latitude.toFixed(2)),
    //         longitude: parseFloat(position.coords.longitude.toFixed(2)),
    //         accuracy: position.coords.accuracy,
    //       });
    //       setLoading(false);
    //     },
    //     (error) => {
    //       setError(error.message);
    //       setLoading(false);
    //     },
    //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    //   );
    // };

  //   requestPermissionAndGetLocation();
  // }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS handles permissions in Info.plist
  };

  return (
    <View style={styles.locationContainer}>
      {loading && <ActivityIndicator size="large" />}
      {error && <Text style={{ color: "red" }}>Error: {error}</Text>}
      {location ? (
        <View>
          <Text style={styles.bodyText}>🌍 {location.latitude}°, {location.longitude}°</Text>
        </View>
      ) : (
        !loading && <Text>No location data available.</Text>
      )}
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>MotorVision</Text>
      </View>
      <View style={styles.stepContainer}></View>
      <LocationView /> {/* Added Location Component */}
      <View style={styles.helmetContainer}>
        <Text style={styles.connectText}>Connect to a Device</Text>
      </View>
      <View style={styles.helmetContainer}>
        <RotatingImage />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  application: {
    flex: 1,
    backgroundColor: "#F3F3F3",
  },
  titleContainer: {
    marginTop: 100,
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  titleText: {
    fontSize: 60,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  stepContainer: {
    marginTop: 5,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    fontWeight: "bold",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  helmetContainer: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  connectText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  locationContainer: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  bodyText: {
    fontSize: 20,
    textAlign: "center",
    color: "white",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
});
