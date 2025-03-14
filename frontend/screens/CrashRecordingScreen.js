import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Location from "expo-location";
import axios from "axios";
import { getHasPermission } from "./locationPermissionStore";
// import { logToLogBoxAndConsole } from "react-native-reanimated/lib/typescript/logger";

export function LocationView() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverResponse, setServerResponse] = useState(null);

  useEffect(() => {
    let locationSubscription = null;

    // would call this in connect instead - nvm
    const requestPermissionAndTrackLocation = async () => {
      {/*const hasPermission = await requestLocationPermission(); */}
      if (!getHasPermission()) {
        alert("Location permission denied");
        setError("Location permission denied");
        setLoading(false);
        return;
      }
      console.log("Working w this permission rn", getHasPermission()); // this doesn't look
      try {
        // Start watching the user's location
        console.log("Trying to get location"); // ebfore loop
        // this is where the loop starts 
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation, // Highest accuracy
            timeInterval: 5000, // Get location updates every 5 seconds - this would change according to the rate that the user specifies
            distanceInterval: 2, // Update when user moves 2 meters
          },
          async (position) => {
            // think about everything that i want from this
            const newLocation = {
              latitude: parseFloat(position.coords.latitude.toFixed(2)), // More precision
              longitude: parseFloat(position.coords.longitude.toFixed(2)),
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude, // Elevation data
              speed: position.coords.speed, // Speed in meters/sec
              heading: position.coords.heading, // Compass direction
          };
            setLocation(newLocation); // resetting the variable -> change this to array
            // calling the 
            console.log("recieved location")
            await sendLocationToServer(newLocation.latitude, newLocation.longitude);
            console.log("just sent data to backend")
            setLoading(false);

          }
        );
      } catch (err) {
        setError(err.message);
        setLoading(false);

      }
    };

    requestPermissionAndTrackLocation();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove(); // Stop tracking on unmount
      }
    };
  }, []);

  const sendLocationToServer = async (latitude, longitude) => {
    console.log("Updating backend location,",  latitude, longitude);
    const url = `http://127.0.0.1:8000/live_loc/?lat=${latitude}&long=${longitude}`;
    try {
      const response = await axios.get(url);
      console.log("Just recieved live loc from frontend...")
      setServerResponse(response.data)
      console.log(response)
      return response.data
    }  catch (error) {
      console.error("Error fetching/sending the live location:", error);
      return {error: error.message};
      setServerResponse("NO IDEA")
    } finally {
      console.log("Finally statment");
    } // end of try catch
  }; // end of function 
  
  if (loading) return <ActivityIndicator size="large" color="blue" />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View style={styles.locationContainer}>
      {/*{location ? (
        <View>
          <Text style={styles.bodyText}>🌍 Latitude: {location.latitude}</Text>
          <Text style={styles.bodyText}>🌍 Longitude: {location.longitude}</Text>
          {/* Optionally display more location details 
        </View>
      ) : (
        <Text>No location data available.</Text>
      )} */}

      {serverResponse && (
        <View style={styles.locationContainer}>
          <Text style={styles.bodyText}>Server Response:</Text>
          <Text style={styles.bodyText}>{JSON.stringify(serverResponse, null, 2)}</Text>
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