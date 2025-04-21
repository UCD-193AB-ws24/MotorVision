import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Accelerometer } from 'expo-sensors';

export default function CrashRecordingScreen({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [count, setCount] = useState(0);

  // Accelerometer data state
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });

  // Arrays to store data points collected
  const [oneMinuteBuffer, setOneMinuteBuffer] = useState([]);
  const [slidingWindow, setSlidingWindow] = useState([]);

  // Subscribe to accelerometer updates
  const _subscribe = () => {
    Accelerometer.setUpdateInterval(2000); // Ensure slow updates
    const subscription = Accelerometer.addListener(setData);
    return subscription;
  };

  // Unsubscribe when component unmounts
  const _unsubscribe = (subscription) => {
    if (subscription) {
      subscription.remove();
    }
  };

  useEffect(() => {
    let subscription = null;
    if (isRecording) {
      subscription = _subscribe();
    } else {
      _unsubscribe(subscription);
    }

    return () => {
      _unsubscribe(subscription);
    };
  }, [isRecording]);

  // Start or stop recording
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
        const existingLogs = await AsyncStorage.getItem('crashLogs');
        const logs = existingLogs ? JSON.parse(existingLogs) : [];

        // Save new log
        logs.unshift(newLog);
        await AsyncStorage.setItem('crashLogs', JSON.stringify(logs));
      } catch (error) {
        console.error('Error saving log:', error);
      }

      setIsRecording(false);
      setStartTime(null);

      // Navigate to crash logs after stopping
      navigation.navigate('CrashLogs');

      // Clear data buffers when stopping the recording
      setOneMinuteBuffer([]);
    } else {
      // Starting Recording
      setStartTime(new Date());
      setIsRecording(true);
    }
  };

  // // Update one-minute buffer every 2 seconds
  // const sendDataToAPI = (data) => {
  //   console.log('Sending data to API:', data);
  
  //   if (data.length > 0) {
  //     setSlidingWindow(prevWindow => {
  //       const updatedWindow = [...prevWindow, ...data];
  //       console.log('Updated Sliding Window:', updatedWindow);
  //       return updatedWindow.length > 30 ? updatedWindow.slice(-30) : updatedWindow; 
  //     });
  //   }
  // };
  
  // Update one-minute buffer every 2 seconds
  useEffect(() => {
    const intervalId = isRecording && setInterval(() => {
      setOneMinuteBuffer(prevBuffer => {
        const newBuffer = [...prevBuffer, { x, y, z, timestamp: Date.now() }];
        // console.log('One-Minute Buffer Updated:', newBuffer);
  
        if (newBuffer.length >= 30) {
          // console.log('Buffer reached 30 entries. Sending to API:', newBuffer);
          // sendDataToAPI(newBuffer);
          return []; // Clear buffer after sending
        }
  
        return newBuffer;
      });
    }, 2000);
  
    return () => clearInterval(intervalId);
  }, [isRecording, x, y, z]);
  
  // Send one-minute buffer every minute (and clear it)
  // useEffect(() => {
  //   const sendIntervalId = isRecording && setInterval(() => {
  //     if (oneMinuteBuffer.length > 0) {
  //       console.log('Sending One-Minute Buffer to API:', oneMinuteBuffer);
  //       sendDataToAPI(oneMinuteBuffer);
  //       setOneMinuteBuffer([]); // Clear buffer after sending
  //     }
  //   }, 60000);
  
  //   return () => clearInterval(sendIntervalId);
  // }, [isRecording, oneMinuteBuffer]);
  
  useEffect(() => {
    const intervalId = isRecording && setInterval(() => {
      setSlidingWindow(prevWindow => {
      setCount(prevCount => {
          const newCount = prevCount + 1;
          console.log("COUNT:", newCount);
          
          if (newCount >= 60) {
            console.log("SENT TO API");
            return 0; // Reset count after sending
          }
          
          return newCount;
        });
        console.log("COUNT:", count);
        const newWindow = [...prevWindow, { x, y, z, timestamp: Date.now() }];
        console.log('Sliding Window Updated:', newWindow);
        // if(count >= 60) {
        //   console.log("SENT TO API");
        //   setCount(0);
        // }
        // Keep the window size to 60 elements (2 minutes of data)
        if (newWindow.length > 60) {
          return newWindow.slice(-60); // Maintain the last 60 elements (representing the sliding window)
        }
        return newWindow;
      });
    }, 2000); // Update every 2 seconds
  
    return () => clearInterval(intervalId);
  }, [isRecording, x, y, z]);
  
  // // Send sliding window buffer every 2 minutes without clearing it
  // useEffect(() => {
  //   let bufferIntervalId;
  
  //   // Only set the interval when recording starts
  //   if (isRecording) {
  //     bufferIntervalId = setInterval(() => {
  //       console.log("SLIDE SENT TO API:", slidingWindow);  
  //     }, 120000); // Every 2 minutes
  //   } else {
  //     // If recording is stopped, clear the interval
  //     if (bufferIntervalId) {
  //       clearInterval(bufferIntervalId);
  //     }
  //   }
  
  //   // Cleanup function to clear the interval when the effect is cleaned up
  //   return () => {
  //     if (bufferIntervalId) {
  //       clearInterval(bufferIntervalId);
  //     }
  //   };
  // }, [isRecording, slidingWindow]);
  

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
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
    color: "#00bfff",
    textDecorationLine: "underline",
  },
});
