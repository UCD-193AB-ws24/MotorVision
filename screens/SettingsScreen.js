// SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { useBluetoothStore } from '../store/bluetoothStore';

export default function SettingsScreen() {
  const {
    availableDevices,
    connectedDevice,
    connectToDevice,
    disconnectDevice
  } = useBluetoothStore();

  const handleToggleConnection = (device) => {
    if (connectedDevice?.id === device.id) {
      disconnectDevice();
    } else {
      connectToDevice(device);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bluetooth Settings</Text>

      {/* Connection Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {connectedDevice ? `Connected to ${connectedDevice.name}` : 'Not Connected'}
        </Text>
      </View>

      {/* Available Devices */}
      <FlatList
        data={availableDevices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.deviceContainer}>
            <Text style={styles.deviceName}>{item.name}</Text>
            <Switch
              value={connectedDevice?.id === item.id}
              onValueChange={() => handleToggleConnection(item)}
              trackColor={{ false: '#767577', true: '#0A84FF' }}
              thumbColor={connectedDevice?.id === item.id ? '#0A84FF' : '#f4f3f4'}
            />
          </View>
        )}
      />
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    padding: 15,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
  },
  deviceContainer: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  deviceName: {
    color: '#ffffff',
    fontSize: 16,
  },
});
