import React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Button, PermissionsAndroid, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BluetoothSerial from 'react-native-bluetooth-classic';


// this page is good

// this is the find currently available bluetooth devices
const PairedDevicesScreen = () => {
  const [pairedDevices, setPairedDevices] = useState([]);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Bluetooth permission denied');
      }
    }
  };

  const getPairedDevices = async () => {
    try {
      const devices = await BluetoothSerial.list();
      setPairedDevices(devices);
    } catch (error) {
      console.error('Error fetching paired devices:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={pairedDevices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.buttonText}>{item.name || 'Unknown Device'}</Text>
            <Text style={styles.buttonText}>ID: {item.id}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.connectText}>No paired devices found - realistically the main "SmartHelmet" device would show up here</Text>}
      />
    </View>
  );
};



export default function ConnectDeviceScreen({navigation }) {

  return (
    <LinearGradient
      colors={['#121212', '#1E1E1E', '#292929']} // Gradient effect
      style={styles.container}
    >
      <Text style={styles.title}> Current Paired Devices</Text>

      <Text style={styles.connectText}> Devices with HC-05 module that are paired with phone. </Text>

      <PairedDevicesScreen/>


      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('InstructionsPairNewDevice')}
      >
        <Text style={styles.buttonText}>How Do I Pair a New Device</Text>
      </TouchableOpacity>

    
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to Home Screen</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
});
