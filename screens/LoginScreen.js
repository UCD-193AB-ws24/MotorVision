// LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { auth, db } from '../config/firebase'; // Adjust the import path as necessary
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import SignUpScreen from './SignUpScreen';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        console.log('User data:', userDoc.data());
        Alert.alert('Welcome', `Hello, ${userDoc.data().name || user.email}`);
        await AsyncStorage.setItem('userInfo', JSON.stringify({ name: userDoc.data().name }));
      } else {
        console.log('No user data found.');
        Alert.alert('Login Successful', 'But no user data found.');
      }
    } catch (error) {
      setError('Sorry, your email or password was incorrect.');
      // console.error(error);
      // Alert.alert('Login Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>MotorVision</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (error) setError('');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (error) setError('');
        }}        
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>



      <TouchableOpacity style={styles.buttonNoBackground} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { opacity: error ? 1 : 0 }]}>
          {error || ' '}
        </Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Tesla black
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 45,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 8,
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: '#fff',
    backgroundColor: '#111',
  },

  errorContainer: {
  height: 30, 
  justifyContent: 'center',
},

  button: {
    width: '100%',
    backgroundColor: '#0A84FF', // Tesla red
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  errorText: {
  color: '#FF3B30',
  fontSize: 14,
  marginBottom: 10,
  textAlign: 'center',
},

  buttonNoBackground: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LoginScreen;
