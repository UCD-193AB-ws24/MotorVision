import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function QuickNavGrid({ navigation }) {
  return (
    <View style={styles.grid}>
      <Tile icon="map" label="Navigation" onPress={() => navigation.navigate('Navigation')} />
      <Tile icon="history" label="Trips" onPress={() => navigation.navigate('Trip History')} />
      <Tile
        icon="account-group"
        label="Friends"
        onPress={() => navigation.navigate('SettingsTab', { screen: 'Friends' })}
      />
      <Tile
        icon="cog"
        label="Settings"
        onPress={() => navigation.navigate('SettingsTab', { screen: 'Settings' })}
      />
    </View>
  );
}

function Tile({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={26} color="#ccc" />
      <Text style={styles.tileText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  tile: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tileText: {
    color: '#ccc',
    marginTop: 6,
    fontSize: 14,
  },
});
