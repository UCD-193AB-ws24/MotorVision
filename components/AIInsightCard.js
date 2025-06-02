import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function AIInsightCard({ insight, loading, accentColor = '#00FFFF' }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.header, { color: accentColor }]}>AI Insight</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#0A84FF" />
      ) : (
        <Text style={styles.text}>{insight}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    width: '80%',
    marginBottom: 20,
  },
  header: {
    fontSize: 16,
    color: '#0A84FF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
});
