import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CrashDetailScreen({ route }) {
  const { crash } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crash Details</Text>
      <Text style={styles.info}>Time: {crash.timestamp}</Text>
      <Text style={styles.info}>Details: {crash.details}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
});
