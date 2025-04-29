import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

export default function Crash3DView({ route, navigation }) {
  const { html } = route.params;

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="#0A84FF" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* 3D Scene WebView */}
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1E1E1E',
  },
  backText: {
    fontSize: 18,
    color: '#0A84FF',
    marginLeft: 5,
  },
  webview: {
    flex: 1,
    backgroundColor: '#121212',
  },
});
