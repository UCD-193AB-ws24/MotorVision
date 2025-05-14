// config/firebase.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Move to environment variables using process.env or expo-constants
const firebaseConfig = {
  apiKey: "AIzaSyAgkbN5aBR-xNswI2uo8WUNhs5E2dOykCI",
  authDomain: "motor-vision-backend.firebaseapp.com",
  projectId: "motor-vision-backend",
  storageBucket: "motor-vision-backend.firebasestorage.app",
  messagingSenderId: "1015734436024",
  appId: "1:1015734436024:web:88cdadc74f40ad91f7f44d",
  measurementId: "G-2EJHJC6QLF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Setup Auth with React Native persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  console.warn('initializeAuth failed, falling back to getAuth:', error);
  auth = getAuth(app);
}

// Firestore database
const db = getFirestore(app);

export { auth, db };
