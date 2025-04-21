import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // For trash icon

export default function CrashLogsScreen({ navigation }) {
  const [crashLogs, setCrashLogs] = useState([]);

  // Load logs from AsyncStorage
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const logs = await AsyncStorage.getItem("crashLogs");
        setCrashLogs(logs ? JSON.parse(logs) : []);
      } catch (error) {
        console.error("Error loading logs:", error);
      }
    };

    const focusListener = navigation.addListener("focus", loadLogs);
    return focusListener;
  }, [navigation]);

  // Function to delete a log
  const deleteLog = async (id) => {
    try {
      const updatedLogs = crashLogs.filter((log) => log.id !== id);
      setCrashLogs(updatedLogs);
      await AsyncStorage.setItem("crashLogs", JSON.stringify(updatedLogs));
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#121212", "#1E1E1E", "#292929"]}
      style={styles.container}
    >
      <Text style={styles.title}>Crash Reports</Text>

      <FlatList
        data={crashLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <TouchableOpacity
              style={styles.logContent}
              onPress={() =>
                navigation.navigate("CrashDetail", { crash: item })
              }
            >
              <View>
                <Text style={styles.logText}>{item.timestamp}</Text>
                <Text style={styles.logDetails}>{item.details}</Text>
              </View>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity onPress={() => deleteLog(item.id)}>
              <Ionicons
                name="trash-outline"
                size={24}
                color="#ff4d4d"
                style={styles.trashIcon}
              />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Back to Recording Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CrashRecording")}
      >
        <Text style={styles.buttonText}>Back to Recording</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

// 🌟 Styles (Updated)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    marginTop: 60,
  },
  logItem: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row", // Allow side-by-side alignment
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#00bfff",
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  logContent: {
    flex: 1,
  },
  logText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  logDetails: {
    fontSize: 14,
    color: "#bbb",
  },
  trashIcon: {
    padding: 8,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#00bfff",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#00bfff",
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

