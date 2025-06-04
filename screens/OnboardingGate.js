import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function OnboardingGate() {
  const navigation = useNavigation();

  useEffect(() => {
    const checkProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const { name, profileImage } = userSnap.data();
          if (name && profileImage) {
            navigation.replace('MainTabs');
          } else {
            navigation.replace('ProfileSetup');
          }
        } else {
          navigation.replace('ProfileSetup');
        }
      } catch (err) {
        console.error('[OnboardingGate] Error:', err);
        navigation.replace('ProfileSetup');
      }
    };

    checkProfile();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
      <ActivityIndicator size="large" color="#0A84FF" />
    </View>
  );
}
