import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import HomeScreen from './screens/HomeScreen';
import NavigationScreen from './screens/NavigationScreen';
import RideInsightsScreen from './screens/RideInsightsScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#121212',
    card: '#1E1E1E',       // Footer color
    text: '#FFFFFF',
    border: '#272727',
    notification: '#0A84FF',
  },
};

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
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
