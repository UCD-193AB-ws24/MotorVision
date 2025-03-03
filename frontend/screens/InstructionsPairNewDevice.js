import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// this page is good

// this is the instructions
const data = [
  {id: '1', name: "1. Turn on your mobile phone's bluetooth feature."},
  {id: '2', name: "2. Navigate to your mobile phone's bluetooth device settings."},
  {id: '3', name: "3. Identify a bluetooth device titled HC-05."},
  {id: '4', name: "4. Connect to the bluetooth device, and enter the password for the device if prompted."},
  {id: '5', name: "5. Go back to the Change Device screen to see if the device showed up."},
]

export default function InstructionsPairNewDevice({navigation }) {

  return (
    <LinearGradient
      colors={['#121212', '#1E1E1E', '#292929']} // Gradient effect
      style={styles.container}
    >
      <Text style={styles.title}> How to Pair a New Device to Phone</Text>
      <Text style={styles.title}> </Text>

      <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.instructionsText}>{item.name}</Text>
          </View>
        )}
      />
    </View>

    
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to Change New Device</Text>
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
  item: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',

  },
});
