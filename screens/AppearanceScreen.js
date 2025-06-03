import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeContext } from './ThemeCustomization';

const themes = [
    { name: "iOS Default", accent: '#0A84FF' },
  { name: "Pretty in Pink", accent: '#ff4081' },
  { name: "Evergreen", accent: '#228B22' },
  { name: "Sunshine", accent: '#FFD700' },
  { name: "Violet Hues", accent: '#800080'},
  { name: "Sunset", accent: '#FFA500' }
];

export default function AppearanceScreen({ navigation }) {
  const { updateTheme } = useContext(ThemeContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Accent Color:</Text>
      {themes.map((t, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => updateTheme(t)}
          style={[styles.accentButton, { backgroundColor: t.accent }]}
        >
          <Text style={styles.buttonText}>{t.name}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back to Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, marginBottom: 10 },
  accentButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#0A84FF',
    borderRadius: 10,
    alignItems: 'center',
  },
});
