// config/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAgkbN5aBR-xNswI2uo8WUNhs5E2dOykCI",
  authDomain: "motor-vision-backend.firebaseapp.com",
  projectId: "motor-vision-backend",
  storageBucket: "motor-vision-backend.appspot.com", // <-- Fixed ".app" to ".com"
  messagingSenderId: "1015734436024",
  appId: "1:1015734436024:web:88cdadc74f40ad91f7f44d",
  measurementId: "G-2EJHJC6QLF"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const storage = getStorage(app);

export { db, auth, storage };
