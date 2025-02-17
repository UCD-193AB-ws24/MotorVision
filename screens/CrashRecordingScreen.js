import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function CrashRecordingScreen({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement crash data collection logic
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isRecording ? 'Recording Crash Data...' : 'Press Start to Record'}
      </Text>
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={toggleRecording}
        color={isRecording ? 'red' : 'green'}
      />
      <Button
        title="View Crash Logs"
        onPress={() => navigation.navigate('CrashLogs')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
});
