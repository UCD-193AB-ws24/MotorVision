// profileService.js
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_CACHE_KEY = 'userInfo';

export const hydrateProfile = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();

      // Format createdAt for easy local usage
      const createdAtFormatted = data.createdAt?.seconds
        ? new Date(data.createdAt.seconds * 1000).toLocaleDateString()
        : '';

      // Cache minimal data
      await AsyncStorage.setItem(
        PROFILE_CACHE_KEY,
        JSON.stringify({
          name: data.name || '',
          createdAt: data.createdAt?.seconds || '',
        }),
      );

      return {
        name: data.name || '',
        email: data.email || user.email || '',
        bio: data.bio || '',
        profileImage: data.profileImage || '',
        createdAt: createdAtFormatted,
      };
    }
  } catch (err) {
    console.error('[profileService] Hydrate error:', err);
    throw err;
  }

  return null;
};

export const updateProfile = async (profileData, createdAt) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await updateDoc(doc(db, 'users', user.uid), profileData);

    // Update local cache (minimal fields)
    await AsyncStorage.setItem(
      PROFILE_CACHE_KEY,
      JSON.stringify({
        name: profileData.name || '',
        createdAt: createdAt ? new Date(createdAt).getTime() / 1000 : '',
      }),
    );
  } catch (err) {
    console.error('[profileService] Update error:', err);
    throw err;
  }
};

export const getCachedProfile = async () => {
  try {
    const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
    if (cached) {
      const { name, createdAt } = JSON.parse(cached);
      return {
        name: name || '',
        createdAt: createdAt
          ? new Date(createdAt * 1000).toLocaleDateString()
          : '',
      };
    }
  } catch (err) {
    console.error('[profileService] Read cache error:', err);
  }

  return { name: '', createdAt: '' };
};
