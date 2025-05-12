import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function SettingsScreen({ navigation }) {
  const settingsOptions = [
    {
      title: "Profile",
      icon: "person-circle-outline",
      onPress: () => navigation.navigate('SettingsTab', { screen: 'Profile' }),
    },
    {
      title: "Friends",
      icon: "people-outline",
      onPress: () => navigation.navigate('Friends'),
    },
    {
      title: "Notifications",
      icon: "notifications-outline",
      onPress: () => alert('Notifications Settings coming soon!'),
    },
    {
      title: "Privacy & Security",
      icon: "shield-outline",
      onPress: () => alert('Privacy & Security Settings coming soon!'),
    },
    {
      title: "Sensor and Location Services",
      icon: "location-outline",
      onPress: () => alert('Sensor and Location Settings coming soon!'),
    },
    {
      title: "Appearance",
      icon: "color-palette-outline",
      onPress: () => alert('Appearance Settings coming soon!'),
    },
    {
      title: "Help & Support",
      icon: "help-circle-outline",
      onPress: () => alert('Help & Support coming soon!'),
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <FlatList
        data={settingsOptions}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.settingItem} onPress={item.onPress}>
            <Ionicons name={item.icon} size={24} color="#0A84FF" style={styles.icon} />
            <Text style={styles.settingText}>{item.title}</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#888" />
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.guideButton}
        onPress={() => navigation.navigate('SettingsTab', { screen: 'PairingGuide' })}
      >
        <Ionicons name="bluetooth-outline" size={24} color="#ffffff" style={styles.icon} />
        <Text style={styles.buttonText}>How to Pair a Device</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Home Screen</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
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
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  settingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  guideButton: {
    marginTop: 20,
    backgroundColor: '#00bfff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00bfff',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
    elevation: 4,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF453A',
  },
  signOutText: {
    color: '#FF453A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
