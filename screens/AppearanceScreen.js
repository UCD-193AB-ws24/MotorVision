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
          style={styles.row}
          onPress={() => updateTheme(theme)}
        >
          <View
            style={[styles.circle, { backgroundColor: theme.accent }]}
          />
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
});
