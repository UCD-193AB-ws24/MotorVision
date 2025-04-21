import React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Button, PermissionsAndroid, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


export default function SettingsScreen({navigation }) {
    const settingsOptions = [
        { title: "Account", onPress: () => navigation.navigate("AccountSettings") },
        { title: "Notifications", onPress: () => navigation.navigate("NotificationSettings") },
        { title: "Privacy & Security", onPress: () => navigation.navigate("PrivacySettings") },
        { title: "Sensor and Location Services", onPress: () => navigation.navigate("SensorAndLocationSettings") },
        { title: "Appearance", onPress: () => navigation.navigate("AppearanceSettings") },
        { title: "Help & Support", onPress: () => navigation.navigate("HelpSupport") },
      ];

  return (
    <LinearGradient
      colors={['#121212', '#1E1E1E', '#292929']} // Gradient effect
      style={styles.container}
    >
      <View style={styles.paddingContatiner}>
      <Text style={styles.title}>Settings</Text>
      {settingsOptions.map((option, index) => (
          <TouchableOpacity key={index} style={styles.logItem} onPress={option.onPress}>
            <Text style={styles.buttonText}>{option.title}</Text>
          </TouchableOpacity>
        ))}


      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to Home Screen</Text>
      </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  paddingContainer: {
    flex: 1,
    paddingTop: 50,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailBox: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#00bfff',
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  info: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#00bfff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#00bfff',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  connectText: {
    fontSize: 16,
    color: '#fff',
    textAlign: "center"
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
});
