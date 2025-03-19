import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import axios from "axios";

// AI generation added to pass location data over from one screen to another

export default function CrashRecordingScreen({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [locations, setLocations] = useState([]); // Manage locations here
  const [error, setError] = useState(null);
  const locationSubscription = useRef(null);
  const uploadInterval = useRef(null);

  const toggleRecording = async () => {
    if (isRecording) {
      const endTime = new Date();
      const duration = (endTime - startTime) / 1000; // Duration in seconds
      const finalDuration = duration > 300 ? 300 : duration;

      const newLog = {
        id: Date.now().toString(),
        timestamp: endTime.toLocaleString(),
        duration: finalDuration,
        details: `Crash data recorded for ${Math.round(finalDuration)} seconds`,
        location: [...locations], // Use the locations from state
      };

      // Save the log
      try {
        const existingLogs = await AsyncStorage.getItem("crashLogs");
        const logs = existingLogs ? JSON.parse(existingLogs) : [];
        logs.unshift(newLog);
        await AsyncStorage.setItem("crashLogs", JSON.stringify(logs));
      } catch (error) {
        console.error("Error saving log:", error);
      }

      setIsRecording(false);
      setStartTime(null);

      // Navigate to crash logs after stopping
      navigation.navigate("CrashLogs");

      // Optionally, send locations to the server for image generation
      imageGeneration([...locations]); // Send to the server
    } else {
      // Start recording
      setStartTime(new Date());
      setIsRecording(true);
    }
  };

  // Send locations for image generation
  const imageGeneration = async (locations) => {
    console.log("Sending locations to backend for image generation", locations);
    const url = `http://3.147.83.156:8000/traj_image_live/`;
    try {
      const response = await axios.post(url, { locations });
      console.log("Server response for image generation", response.data);
    } catch (error) {
      console.error("Error sending location for image generation:", error);
    }
  };

  // Handle location permission and tracking
  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location permission denied");
        setError("Location permission denied");
        return;
      }

      startTracking();
    };

    const startTracking = async () => {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // 1 second updates
        },
        (position) => {
          console.log("Location Updated");
          const newLocation = {
            timestamp: new Date().toISOString("en-US", { timeZone: "America/Los_Angeles" }),
            latitude: parseFloat(position.coords.latitude.toFixed(6)),
            longitude: parseFloat(position.coords.longitude.toFixed(6)),
          };

          // Add new location to state
          setLocations((prevLocations) => {
            const updatedLocations = [...prevLocations, newLocation];
            if (updatedLocations.length > 30) updatedLocations.shift(); // Keep last 30 locations
            return updatedLocations;
          });
        }
      );

      uploadInterval.current = setInterval(() => {
        if (locations.length >= 10) {
          sendLocationToServer([...locations]);
        }
      }, 30000);
    };

    if (isRecording) {
      requestPermission();
    } else {
      if (locationSubscription.current) locationSubscription.current.remove();
      if (uploadInterval.current) clearInterval(uploadInterval.current);
    }

    return () => {
      if (locationSubscription.current) locationSubscription.current.remove();
      if (uploadInterval.current) clearInterval(uploadInterval.current);
    };
  }, [isRecording, locations]);

  return (
    <LinearGradient colors={["#121212", "#1E1E1E", "#292929"]} style={styles.container}>
      <Text style={styles.title}>MotorVision</Text>
      <Text style={styles.status}>
        {isRecording ? "Recording Crash Data..." : "Tap to Start Recording"}
      </Text>

      <TouchableOpacity
        style={[styles.button, isRecording ? styles.buttonActive : styles.buttonInactive]}
        onPress={toggleRecording}
      >
        <Text style={styles.buttonText}>{isRecording ? "Stop" : "Start"}</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate("CrashLogs")}>
        <Text style={styles.linkText}>View Crash Reports</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    color: "#bbb",
    marginBottom: 30,
  },
  button: {
    width: 180,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  buttonActive: {
    backgroundColor: "red",
    shadowColor: "red",
  },
  buttonInactive: {
    backgroundColor: "#00bfff",
    shadowColor: "#00bfff",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
    color: "#00bfff",
    textDecorationLine: "underline",
  },
});
