import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeContext } from './ThemeCustomization';
import { Ionicons } from '@expo/vector-icons';


const themes = [
  { name: 'iOS Default', accent: '#0A84FF' },
  { name: 'Pretty Pink', accent: '#ff4081' },
  { name: 'Evergreen', accent: '#228B22' },
  { name: 'Sunshine', accent: '#FFD700' },
  { name: 'Violet Hues', accent: '#800080' },
  { name: 'Sunset', accent: '#FFA500' },
  { name: 'Sky', accent: '#87CEEB' },
  { name: 'Coral', accent: '#FF7F50' },
  { name: 'Mint', accent: '#98FF98' },
  { name: 'Lava Red', accent: '#D32F2F' },
  { name: 'Teal Dream', accent: '#008080' },
  { name: 'Rose Gold', accent: '#B76E79' },
];

export default function AppearanceScreen({ navigation }) {
  const { updateTheme } = useContext(ThemeContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customize App Display</Text>

      {themes.map((theme, index) => (
  <TouchableOpacity
    key={index}
    onPress={() => updateTheme(theme)}
    style={[
      styles.box,
      {
        borderColor: theme.accent,
        shadowColor: theme.accent,
      },
    ]}
    activeOpacity={0.8}
  >
    <View style={[styles.circle, { backgroundColor: theme.accent }]} />
    <Text style={[styles.colorText, { color: theme.accent }]}>
      {theme.name}
    </Text>
  </TouchableOpacity>
))}


    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center'},
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    color: '#fff'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1.0,
    shadowRadius: 8,
    padding: 2,
  // Android fallback
    elevation: 10,
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 12,
    margin: 4
  },
  colorText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#0A84FF',
    borderRadius: 10,
    alignItems: 'center',
  },
   backArrow: {
    alignItems: 'left',
    marginRight: 150,
    marginBottom: 5
  },
  backText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  box: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#111', // container background
  borderRadius: 5,
  paddingBottom: 4,
  paddingRight: 10,
  paddingLeft: 10,
  paddingTop: 4,
  borderWidth: 0.1,
  marginBottom: 14,

  // iOS shadow
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.9,
  shadowRadius: 2,

  // Android shadow
  elevation: 10,
},

});
