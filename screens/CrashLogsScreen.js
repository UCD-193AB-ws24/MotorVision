import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export default function CrashLogsScreen({ navigation }) {
  const [crashLogs, setCrashLogs] = useState([
    { id: '1', timestamp: 'Feb 12, 2025, 10:30 AM', details: 'Crash detected at 30 mph' },
    { id: '2', timestamp: 'Feb 11, 2025, 3:15 PM', details: 'Minor impact detected' },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crash Reports</Text>
      <FlatList
        data={crashLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.logItem}
            onPress={() => navigation.navigate('CrashDetail', { crash: item })}
          >
            <Text>{item.timestamp}</Text>
          </TouchableOpacity>
        )}
      />
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
    marginBottom: 20,
  },
  logItem: {
    padding: 15,
    borderBottomWidth: 1,
  },
});
