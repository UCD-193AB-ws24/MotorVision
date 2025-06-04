// components/PrivacySecurityScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PrivacySecurityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Privacy & Security</Text>
      <Text style={styles.text}>
        Here you can manage your privacy and security settings. Feature coming soon!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 20 },
  text: { fontSize: 16, color: '#cccccc', textAlign: 'center' },
});
