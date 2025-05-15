import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCrashDetection } from '../hooks/useCrashDetection';
import { useSensorBuffer } from '../hooks/useSensorBuffer';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

// Components
import AIInsightCard from '../components/AIInsightCard';
import UserStatsCard from '../components/UserStatsCard';
import QuickNavGrid from '../components/QuickNavGrid';

let aiInsightFetched = false;

export default function HomeScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [speed, setSpeed] = useState(0);
  const isCrashed = useCrashDetection();
  useSensorBuffer();

  const [stats, setStats] = useState({ totalRides: 0, totalMiles: 0, avgSpeed: 0 });
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          await AsyncStorage.setItem('userInfo', JSON.stringify({ name: data.name }));

          const totalMiles = data.stats?.totalDistanceMiles || 0;
          const totalMinutes = data.stats?.totalMinutes || 0;
          const avgSpeed = totalMinutes > 0 ? (totalMiles / (totalMinutes / 60)).toFixed(1) : 0;

          setStats({
            totalRides: data.stats?.totalRides || 0,
            totalMiles: parseFloat(totalMiles.toFixed(1)),
            avgSpeed,
          });

          setJoinDate(data.createdAt?.seconds
            ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
            : '');
        }

        const stored = await AsyncStorage.getItem('userInfo');
        if (stored) {
          const { name } = JSON.parse(stored);
          setUserName(name);
        }
      } catch (err) {
        console.error('[HomeScreen] Failed to fetch user info:', err);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadCachedInsight = async () => {
      const cached = await AsyncStorage.getItem('aiInsightCache');
      if (cached) setAiInsight(cached);
    };
    loadCachedInsight();
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

  const fetchAiInsight = useCallback(async () => {
    setAiLoading(true);
    try {
      const payload = {
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [
          {
            role: 'user',
            content: `I'm using a smart motorcycle helmet app. My riding stats are: total rides: ${stats.totalRides}, miles ridden: ${stats.totalMiles}, average speed: ${stats.avgSpeed} mph. Give me a short, motivational motorcycle-themed insight.`,
          },
        ],
      };

      const headers = {
        Authorization: `Bearer ad08d4d7c7fa837fec21ab725125f1a3f9d930990ff381893cfd66030daee38b`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(
        'https://api.together.xyz/v1/chat/completions',
        {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        }
      );

      const json = await response.json();
      const message = json?.choices?.[0]?.message?.content?.trim();
      setAiInsight(message || 'Insight was empty.');
      await AsyncStorage.setItem('aiInsightCache', message || '');
    } catch (err) {
      console.error('[AI Insight]', err.message);
      setAiInsight('Insight unavailable at this time.');
    } finally {
      setAiLoading(false);
    }
  }, [stats]);

  useFocusEffect(
    useCallback(() => {
      if (!aiInsightFetched && stats.totalRides > 0) {
        aiInsightFetched = true;
        fetchAiInsight();
      }
    }, [fetchAiInsight, stats.totalRides])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.header}>MotorVision</Text>
      {!!userName && <Text style={styles.greeting}>Welcome back, {userName}!</Text>}
      {!!joinDate && <Text style={styles.joined}>Member since {joinDate}</Text>}

      <Animated.Image source={require('../assets/helmet.png')} style={styles.helmet} />

      {isCrashed && (
        <Text style={styles.crashText}>⚠️ Crash Detected</Text>
      )}

      <View style={styles.statCard}>
        <Text style={styles.mainStat}>{speed}</Text>
        <Text style={styles.unit}>mph</Text>
      </View>

      <UserStatsCard
        totalRides={stats.totalRides}
        totalMiles={stats.totalMiles}
        avgSpeed={stats.avgSpeed}
      />

      <AIInsightCard insight={aiInsight} loading={aiLoading} />
      <QuickNavGrid navigation={navigation} />
    </ScrollView>
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
    marginBottom: 4,
  },
  joined: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  helmet: {
    width: 130,
    height: 130,
    marginBottom: 12,
  },
  crashText: {
    color: '#f66',
    fontWeight: 'bold',
    marginBottom: 8,
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
});
