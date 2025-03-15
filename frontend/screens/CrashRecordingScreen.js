import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Location from "expo-location";
import axios from "axios";
import { getHasPermission } from "./locationPermissionStore";
// import { logToLogBoxAndConsole } from "react-native-reanimated/lib/typescript/logger";

export function LocationView() {
  const [locations, setLocations] = useState([]); // Stores location array
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverResponse, setServerResponse] = useState(null);
  const locationSubscription = useRef(null); // Persist subscription reference
  const uploadInterval = useRef(null); // Persist interval reference

  useEffect(() => {
    const requestPermission = async () => {
      if (!getHasPermission()) {
        alert("Location permission denied");
        setError("Location permission denied");
        setLoading(false);
        return;
      }
      startTracking();
    };

    const startTracking = async () => {
      console.log("Permission granted:", getHasPermission());

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000, // call location every 5 seconds
          distanceInterval: 2,
        },
        (position) => {
          const newLocation = {
            latitude: parseFloat(position.coords.latitude.toFixed(2)),
            longitude: parseFloat(position.coords.longitude.toFixed(2)),
          };

          setLocations((prev) => [...prev, newLocation]);
          console.log("Just ran a new location loop", newLocation);

          sendLocationToServer([...locations, newLocation]);
        }
      );

      uploadInterval.current = setInterval(() => {
        if (locations.length > 0) {
          console.log("About to call send to with this much data", locations.length )
          sendLocationToServer(locations);
          setLocations([]); // Reset locations after sending
        } else {
          console.log("Wasn't able to call the the server thing, because not enought in array")
        }
      }, 60000); // sending the location every 60 seconds (in there there )
    };

    requestPermission();

    return () => {
      if (locationSubscription.current) locationSubscription.current.remove();
      if (uploadInterval.current) clearInterval(uploadInterval.current);
    };
  }, []); // Run only on mount

  const sendLocationToServer = async (locations) => {
    console.log("Sending locations to backend:", locations);
    const url = `http://127.0.0.1:8000/location_array/`;
    try {
      const response = await axios.post(url, { locations });
      console.log("Received response from server:", response.data);
      setServerResponse(response.data);
    } catch (error) {
      console.error("Error sending location:", error);
      setServerResponse("Error sending location");
    }
  };

  if (loading) return <ActivityIndicator size="large" color="blue" />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View style={styles.locationContainer}>
      {serverResponse && (
        <View>
          <Text style={styles.bodyText}>Server Response:</Text>
          <Text style={styles.bodyText}>Locations stored: {locations.length}</Text>
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
      // Stopping Recording
      const endTime = new Date();
      const duration = (endTime - startTime) / 1000; // Duration in seconds

      // Only store last 5 minutes (300 seconds) of recording
      const finalDuration = duration > 300 ? 300 : duration;

      // Create new log entry
      const newLog = {
        id: Date.now().toString(),
        timestamp: endTime.toLocaleString(),
        duration: finalDuration,
        details: `Crash data recorded for ${Math.round(finalDuration)} seconds`,
      };

      try {
        // Retrieve existing logs
        const existingLogs = await AsyncStorage.getItem("crashLogs");
        const logs = existingLogs ? JSON.parse(existingLogs) : [];

        // Save new log
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
      // Starting Recording
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

      <LocationView /> {/* added what i create */}

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