import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function StatsScreen() {
  return (
    <LinearGradient
      colors={["#121212", "#1E1E1E", "#292929"]}
      style={styles.container}
    >
      <Text style={styles.title}>📊 Stats Screen (Coming Soon)</Text>
      <Text style={styles.text}>This page is under development...</Text>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#bbb",
  },
});
