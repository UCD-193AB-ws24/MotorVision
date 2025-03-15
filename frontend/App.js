import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";


// Import Screens
import HomeScreen from "./screens/HomeScreen";
import ConnectDeviceScreen from "./screens/ConnectDeviceScreen";
import InstructionsPairNewDevice from "./screens/InstructionsPairNewDevice";

import CrashLogsScreen from "./screens/CrashLogsScreen";
import CrashDetailScreen from "./screens/CrashDetailScreen";
import StatsScreen from "./screens/StatsScreen";
import CrashRecordingScreen from "./screens/CrashRecordingScreen";
import { LineGraph } from "./screens/LineGraph";
import StatDetails from "./screens/StatsDetails";

// Create Stack Navigator for Home Screen (Connect to Device)
const HomeScreenStack = createStackNavigator();
function HomeScreenNavigator() {
  return (
    <HomeScreenStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeScreenStack.Screen name="HomeScreen" component={HomeScreen} />
      <HomeScreenStack.Screen name="ConnectDeviceScreen" component={ConnectDeviceScreen} />
      <HomeScreenStack.Screen name="InstructionsPairNewDevice" component={InstructionsPairNewDevice} />
    </HomeScreenStack.Navigator>
  );
}

const SettingsStack = createStackNavigator();
function SettingsNavigator() {
  return (
    <SettingsNavigator.Navigator screenOptions={{ headerShown: false }}>
      <SettingsNavigator.Screen name="SettingsScreen" component={SettingsScreen} />
    </SettingsNavigator.Navigator>
  );
}

// Create Stack Navigator for Crash Data (Crash Logs + Crash Recording)
const CrashStack = createStackNavigator();
function CrashStackNavigator() {
  return (
    <CrashStack.Navigator screenOptions={{ headerShown: false }}>
      <CrashStack.Screen name="CrashRecording" component={CrashRecordingScreen} />
      <CrashStack.Screen name="CrashLogs" component={CrashLogsScreen} />
      <CrashStack.Screen name="CrashDetail" component={CrashDetailScreen} />
    </CrashStack.Navigator>
  );
}


const StatsStack = createStackNavigator(); 

function StatsStackNavigator() {
  return (
    <StatsStack.Navigator screenOptions={{ headerShown: false }}>
      <StatsStack.Screen name="Stats" component={StatsScreen} />
      <StatsStack.Screen name="LineGraph" component={LineGraph} />
      <StatsStack.Screen name="StatDetails" component={StatDetails} />
    </StatsStack.Navigator>
  );
}
// Create Bottom Tab Navigator
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = "home-outline";
            } else if (route.name === "Stats") {
              iconName = "bar-chart-outline";
            } else if (route.name === "Crash Data") {
              iconName = "alert-circle-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarStyle: { backgroundColor: "#1E1E1E", borderTopColor: "transparent" },
          tabBarActiveTintColor: "#00bfff",
          tabBarInactiveTintColor: "#bbb",
          headerShown: false,
        })}
      >
        <Tab.Screen name="Stats" component={StatsStackNavigator} />
        <Tab.Screen name="Home" component={HomeScreenNavigator} />
        <Tab.Screen name="Crash Data" component={CrashStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
