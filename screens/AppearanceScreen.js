import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeContext } from './ThemeCustomization';

const themes = [
  { accent: '#ff4081' },
  { accent: '#0A84FF' },
  { accent: '#228B22' },
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
          <Text style={styles.buttonText}>Accent {index + 1}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back</Text>
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
