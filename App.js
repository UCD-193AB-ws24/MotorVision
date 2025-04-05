import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';

import HomeScreen from './screens/HomeScreen';
import NavigationScreen from './screens/NavigationScreen';
import RideInsightsScreen from './screens/RideInsightsScreen';
import SettingsScreen from './screens/SettingsScreen';
import CrashDetailScreen from './screens/CrashDetailScreen';
import PairingGuideScreen from './screens/PairingGuideScreen';
import TripHistoryScreen from './screens/TripHistoryScreen';
import TripDetailScreen from './screens/TripDetailScreen'; // Import Trip Detail Screen

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#272727',
    notification: '#0A84FF',
  },
};

// Stack for Trip History + Trip Detail
function TripStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
    </Stack.Navigator>
  );
}

// Stack for Settings + Pairing Guide
function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen
        name="PairingGuide"
        component={PairingGuideScreen}
        options={{ tabBarButton: () => null }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Home': iconName = 'home'; break;
              case 'Navigation': iconName = 'map'; break;
              case 'Insights': iconName = 'stats-chart'; break;
              case 'Trip History': iconName = 'time'; break;
              case 'Settings': iconName = 'settings'; break;
              default: iconName = 'ellipse'; break;
            }
            return <Ionicons name={iconName} size={24} color={color} />;
          },
          tabBarActiveTintColor: '#0A84FF',
          tabBarStyle: { height: 70, paddingBottom: 10 },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Navigation" component={NavigationScreen} />
        <Tab.Screen name="Insights" component={RideInsightsScreen} />
        <Tab.Screen name="Trip History" component={TripStack} />
        <Tab.Screen name="Settings" component={SettingsStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
