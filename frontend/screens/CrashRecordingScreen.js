import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import axios from "axios";
import { getHasPermission } from "./locationPermissionStore";

export function LocationView({ isRecording, setIsRecording }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverResponse, setServerResponse] = useState(null);
  
  const locationsRef = useRef([]); // Stores location array efficiently
  const locationSubscription = useRef(null);
  const uploadInterval = useRef(null);

  useEffect(() => {
    const requestPermission = async () => {
      if (!getHasPermission()) {
        Alert.alert("Location permission denied");
        setError("Location permission denied");
        setLoading(false);
        return;
      }
      startTracking();
    };

    const startTracking = async () => {
      console.log("Permission granted in crash recordings:", getHasPermission());

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // 1 second updates
        },
        (position) => {
          console.log("Location updated:", position.coords.latitude, position.coords.longitude);
          const newLocation = {
            timestamp: new Date().toISOString("en-US", { timeZone: "America/Los_Angeles" }),
            latitude: parseFloat(position.coords.latitude.toFixed(6)),
            longitude: parseFloat(position.coords.longitude.toFixed(6)),
          };

          locationsRef.current.push(newLocation);
          if (locationsRef.current.length > 30) {
            locationsRef.current.shift(); // Maintain a sliding window of 30 locations
          }
        }
      );

      uploadInterval.current = setInterval(() => {
        if (locationsRef.current.length >= 10) {
          console.log("Sending locations:", locationsRef.current.length);
          sendLocationToServer([...locationsRef.current]); // Send a copy of the locations
        }
      }, 30000); // Send every 30 seconds - figure out whether to make this about time or length of array
    };

    if (isRecording) {
      requestPermission();
    } else {
      imageGeneration([...locationsRef.current]); // send the final array to the 
      if (locationSubscription.current) locationSubscription.current.remove();
      if (uploadInterval.current) clearInterval(uploadInterval.current);
    }

    return () => {
      if (locationSubscription.current) locationSubscription.current.remove();
      if (uploadInterval.current) clearInterval(uploadInterval.current);
    };
  }, [isRecording]);

  const sendLocationToServer = async (locations) => {
    console.log("Sending locations to backend:", locations);
    const url = `http://127.0.0.1:8000/location_array/`;
    try {
      const response = await axios.post(url, { locations });
      console.log("Server response:", response.data);
      setServerResponse(response.data);
    } catch (error) {
      console.error("Error sending location:", error);
      setServerResponse("Error sending location");
    }
  };

  const imageGeneration = async (locations) => {
    console.log("Sending locations to backend for image generation", locations);
    const url = `http://127.0.0.1:8000/traj_image_live/`;
    try {
      const response = await axios.post(url, { locations});
      console.log("Server response for image generation", response.data);
      setServerResponse(response.data);
    } catch (error) {
      console.error("Error sending location for image generation:", error);
      setServerResponse("Error sending location for image generation");
    }
  };

  // if (loading) return <ActivityIndicator size="large" color="blue" />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View style={styles.locationContainer}>
      {serverResponse && (
        <View>
          <Text style={styles.bodyText}>Server Response:</Text>
          <Text style={styles.bodyText}>Locations stored: {locationsRef.current.length}</Text>
        </View>
      )}
    </View>
  );
}

export default function CrashRecordingScreen({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      const endTime = new Date();
      const duration = (endTime - startTime) / 1000; // Duration in seconds
      const finalDuration = duration > 300 ? 300 : duration;

      // Save the log
      const newLog = {
        id: Date.now().toString(),
        timestamp: endTime.toLocaleString(),
        duration: finalDuration,
        details: `Crash data recorded for ${Math.round(finalDuration)} seconds`,
      };

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
    } else {
      // Start recording
      setStartTime(new Date());
      setIsRecording(true);
    }
  };

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

      {/* Location tracking will be started/paused based on the isRecording state */}
      <LocationView isRecording={isRecording} setIsRecording={setIsRecording} />

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
  bodyText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
    color: "#00bfff",
    textDecorationLine: "underline",
  },
  locationContainer: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
