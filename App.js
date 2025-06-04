import React, { useEffect, useState, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { ThemeProvider } from './screens/ThemeCustomization';
import { ThemeContext } from './screens/ThemeCustomization';

import { useProfileStore } from './store/profileStore';
import { useBluetoothStore } from './store/bluetoothStore';

// Screens
import HomeScreen from './screens/HomeScreen';
import NavigationScreen from './screens/NavigationScreen';
import RideInsightsScreen from './screens/RideInsightsScreen';
import SettingsScreen from './screens/SettingsScreen';
import CrashDetailScreen from './screens/CrashDetailScreen';
import PairingGuideScreen from './screens/PairingGuideScreen';
import TripHistoryScreen from './screens/TripHistoryScreen';
import TripDetailScreen from './screens/TripDetailScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import FriendsScreen from './screens/FriendsScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import PreRouteAnalysis from './screens/PreRouteAnalysis';
import SensorAndLocationScreen from './screens/SensorAndLocationScreen';
import OnboardingGate from './screens/OnboardingGate';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import NotificationsScreen from './screens/NotificationsScreen'; // ✅ Added
import PrivacySecurityScreen from './screens/PrivacySecurityScreen'; // ✅ Added
import AppearanceScreen from './screens/AppearanceScreen';
import HelpScreen from './screens/HelpScreen';

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

function LoginStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function TripStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
      <Stack.Screen name="CrashDetail" component={CrashDetailScreen} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="PairingGuide" component={PairingGuideScreen} />
      <Stack.Screen name="SensorAndLocation" component={SensorAndLocationScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="AppearanceScreen" component={AppearanceScreen} />
      <Stack.Screen name="HelpScreen" component={HelpScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { theme } = useContext(ThemeContext);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName;
          switch (route.name) {
            case 'Home': iconName = 'home'; break;
            case 'Preview': iconName = 'location'; break;
            case 'Navigation': iconName = 'map'; break;
            case 'Insights': iconName = 'stats-chart'; break;
            case 'History': iconName = 'time'; break;
            case 'SettingsTab': iconName = 'settings'; break;
            default: iconName = 'ellipse';
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: theme.accent,
        tabBarStyle: { height: 70, paddingBottom: 10 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Preview" component={PreRouteAnalysis} />
      <Tab.Screen name="Navigation" component={NavigationScreen} />
      <Tab.Screen name="Insights" component={RideInsightsScreen} />
      <Tab.Screen name="History" component={TripStack} />
      <Tab.Screen name="SettingsTab" component={SettingsStack} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hydrateProfile = useProfileStore((state) => state.hydrateProfile);
  const loadTripLogs = useBluetoothStore((state) => state.loadTripLogs);
  const clearTripLogs = useBluetoothStore((state) => state.clearTripLogs);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);

        if (currentUser) {
          await hydrateProfile();
          await loadTripLogs();
        } else {
          await clearTripLogs();
        }
      } catch (err) {
        console.error('Auth listener error:', err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [hydrateProfile, loadTripLogs, clearTripLogs]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  return (
    <ThemeProvider>
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="OnboardingGate" component={OnboardingGate} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
          </>
        ) : (
          <Stack.Screen name="LoginStack" component={LoginStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </ThemeProvider>
  );
}
