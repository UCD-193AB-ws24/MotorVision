import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useBluetoothStore } from '../store/bluetoothStore';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  const settingsOptions = [
    { 
      title: "Account", 
      icon: "person-circle-outline", 
      onPress: () => alert('Account Settings coming soon!') 
    },
    { 
      title: "Notifications", 
      icon: "notifications-outline", 
      onPress: () => alert('Notifications Settings coming soon!') 
    },
    { 
      title: "Privacy & Security", 
      icon: "shield-outline", 
      onPress: () => alert('Privacy & Security Settings coming soon!') 
    },
    { 
      title: "Sensor and Location Services", 
      icon: "location-outline", 
      onPress: () => alert('Sensor and Location Settings coming soon!') 
    },
    { 
      title: "Appearance", 
      icon: "color-palette-outline", 
      onPress: () => alert('Appearance Settings coming soon!') 
    },
    { 
      title: "Help & Support", 
      icon: "help-circle-outline", 
      onPress: () => alert('Help & Support coming soon!') 
    },
  ];  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* Render List of Settings */}
      <FlatList
        data={settingsOptions}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={item.onPress}
          >
            <Ionicons 
              name={item.icon} 
              size={24} 
              color="#0A84FF" 
              style={styles.icon}
            />
            <Text style={styles.settingText}>{item.title}</Text>
            <Ionicons 
              name="chevron-forward-outline" 
              size={20} 
              color="#888" 
            />
          </TouchableOpacity>
        )}
      />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Home Screen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingItem: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#0A84FF',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3, // Shadow for Android
  },
  icon: {
    marginRight: 12,
  },
  settingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    flex: 1, // Allow text to expand properly
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0A84FF',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4, // Shadow for Android
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
