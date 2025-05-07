import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCrashDetection } from '../hooks/useCrashDetection';
import { useSensorBuffer } from '../hooks/useSensorBuffer';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [speed, setSpeed] = useState(0);
  const [userName, setUserName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isCrashed = useCrashDetection();
  useSensorBuffer();

  const [stats, setStats] = useState({
    totalRides: 0,
    totalMiles: 0,
    avgSpeed: 0,
  });

  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            await AsyncStorage.setItem('userInfo', JSON.stringify({ name: userData.name }));

            const totalMiles = userData.stats?.totalDistanceMiles || 0;
            const totalMinutes = userData.stats?.totalMinutes || 0;
            const avgSpeed = totalMinutes > 0 ? (totalMiles / (totalMinutes / 60)).toFixed(1) : 0;

            setStats({
              totalRides: userData.stats?.totalRides || 0,
              totalMiles: parseFloat(totalMiles.toFixed(1)),
              avgSpeed,
            });
          }
        }

        const stored = await AsyncStorage.getItem('userInfo');
        if (stored) {
          const { name } = JSON.parse(stored);
          setUserName(name);
        }
      } catch (e) {
        console.error('Failed to load user info:', e);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        Location.watchPositionAsync(
          { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000 },
          (position) => {
            if (position.coords.speed !== null) {
              const speedMph = (position.coords.speed * 2.23694).toFixed(1);
              setSpeed(speedMph < 0 ? 0 : speedMph);
            }
          }
        );
      }
    });
  }, []);

  const fetchAiInsight = async () => {
    setAiLoading(true);
    console.log('[AI] Fetching insight with stats:', stats);
    try {
      const payload = {
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
          {
            role: 'user',
            content: `Based on my recent ride statistics: total rides - ${stats.totalRides}, total miles - ${stats.totalMiles}, average speed - ${stats.avgSpeed} mph. Provide a short personalized motivational insight.`,
          },
        ],
      };

      const headers = {
        Authorization: `Bearer 9ad9bd0724ab63efe6210bb155be872a93a755fef42d258168cc71e382e746b0`, // Replace securely
        'Content-Type': 'application/json',
      };

      console.log('[AI] Sending payload:', payload);
      const response = await axios.post(
        'https://api.together.xyz/v1/chat/completions',
        payload,
        { headers }
      );

      console.log('[AI] Raw response:', response.data);
      const message = response.data?.choices?.[0]?.message?.content?.trim();
      setAiInsight(message || 'Insight was empty.');
    } catch (err) {
      console.error('AI Insight Error:', err.response?.data || err.message);
      setAiInsight('Insight unavailable at this time.');
    } finally {
      setAiLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (stats.totalRides > 0) {
        fetchAiInsight();
      }
    }, [stats])
  );

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://3.147.83.156:8000/connect/');
      setIsConnected(true);
      Alert.alert('Connected', response.data.message || 'SmartHelmet is now connected.');
    } catch (err) {
      setError('Connection failed. Please try again.');
      Alert.alert('Error', 'Unable to connect to SmartHelmet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.header}>MotorVision</Text>
      {userName !== '' && <Text style={styles.greeting}>Welcome back, {userName}!</Text>}

      <Animated.Image
        source={require('../assets/helmet.png')}
        style={[styles.helmet]}
      />

      <View style={styles.statusRow}>
        <Ionicons name={isConnected ? 'checkmark-circle' : 'alert-circle'} size={20} color={isConnected ? '#0f0' : '#f44'} />
        <Text style={styles.statusText}>{isConnected ? 'Helmet Connected' : 'Not Connected'}</Text>
        {isCrashed && <Text style={styles.crashText}>⚠️ Crash Detected</Text>}
      </View>

      <View style={styles.statCard}>
        <Text style={styles.mainStat}>{speed}</Text>
        <Text style={styles.unit}>mph</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Total Rides: {stats.totalRides}</Text>
        <Text style={styles.summaryText}>Total Miles: {stats.totalMiles}</Text>
        <Text style={styles.summaryText}>Avg Speed: {stats.avgSpeed} mph</Text>
      </View>

      <View style={styles.aiInsightCard}>
        <Text style={styles.aiInsightHeader}>AI Insight</Text>
        {aiLoading ? (
          <ActivityIndicator size="small" color="#0A84FF" />
        ) : (
          <Text style={styles.aiInsightText}>{aiInsight}</Text>
        )}
      </View>

      <View style={styles.grid}>
        <Tile icon="map" label="Navigation" onPress={() => navigation.navigate('Navigation')} />
        <Tile icon="history" label="Trips" onPress={() => navigation.navigate('Trip History')} />
        <Tile icon="account-group" label="Friends" onPress={() =>
          navigation.navigate('SettingsTab', { screen: 'Friends' })
        } />
        <Tile icon="cog" label="Settings" onPress={() =>
          navigation.navigate('SettingsTab', { screen: 'Settings' })
        } />
      </View>

      <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
        <Text style={styles.buttonText}>
          {loading ? 'Connecting...' : isConnected ? 'Connected' : 'Connect Helmet'}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </ScrollView>
  );
}

function Tile({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={26} color="#ccc" />
      <Text style={styles.tileText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  greeting: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 12,
  },
  helmet: {
    width: 130,
    height: 130,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 15,
    color: '#ddd',
  },
  crashText: {
    color: '#f66',
    fontWeight: 'bold',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 30,
    borderRadius: 16,
    marginBottom: 16,
    width: '80%',
  },
  mainStat: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  unit: {
    color: '#aaa',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#272727',
    padding: 16,
    borderRadius: 12,
    width: '80%',
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 15,
    color: '#eee',
    textAlign: 'center',
    marginVertical: 2,
  },
  aiInsightCard: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    width: '80%',
    marginBottom: 20,
  },
  aiInsightHeader: {
    fontSize: 16,
    color: '#0A84FF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  aiInsightText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  tile: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tileText: {
    color: '#ccc',
    marginTop: 6,
    fontSize: 14,
  },
  connectButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#ff4d4d',
    marginTop: 10,
  },
});
