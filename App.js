import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import CrashRecordingScreen from './screens/CrashRecordingScreen';
import CrashLogsScreen from './screens/CrashLogsScreen';
import CrashDetailScreen from './screens/CrashDetailScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CrashRecording">
        <Stack.Screen name="CrashRecording" component={CrashRecordingScreen} />
        <Stack.Screen name="CrashLogs" component={CrashLogsScreen} />
        <Stack.Screen name="CrashDetail" component={CrashDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
