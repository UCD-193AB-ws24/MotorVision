import { create } from 'zustand';
import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUserByEmail,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
} from '../services/friendService';

export const useProfileStore = create((set, get) => ({
  name: '',
  email: '',
  profileImage: '',
  createdAt: null,
  friends: [],
  pending: [],
  requested: [],

  setName: (newName) => set({ name: newName }),
  setEmail: (newEmail) => set({ email: newEmail }),
  setProfileImage: (uri) => set({ profileImage: uri }),
  setCreatedAt: (value) => set({ createdAt: value }),

  /**
   * Load user’s profile and friend-related info from Firestore
   */
  hydrateProfile: async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return;

    const data = userDoc.data();

    const fetchEmails = async (uids) => {
      const emails = await Promise.all(
        uids.map(async (uid) => {
          const docSnap = await getDoc(doc(db, 'users', uid));
          return docSnap.exists() ? docSnap.data().email : null;
        })
      );
      return emails.filter(Boolean);
    };

    const [friendEmails, pendingEmails, requestedEmails] = await Promise.all([
      fetchEmails(data.friends || []),
      fetchEmails(data.pending || []),
      fetchEmails(data.requested || []),
    ]);

    set({
      name: data.name || '',
      email: data.email || '',
      profileImage: data.profileImage || '',
      createdAt: data.createdAt || null,
      friends: friendEmails,
      pending: pendingEmails,
      requested: requestedEmails,
    });

    await AsyncStorage.setItem('userInfo', JSON.stringify({
      name: data.name || '',
      createdAt: data.createdAt?.seconds || '',
    }));
  },

  sendRequest: async (friendEmail) => {
    const user = auth.currentUser;
    if (!user) return;

    const { friends, requested, pending } = get();

    if (friends.includes(friendEmail)) {
      alert('You are already friends with this user.');
      return;
    }
    if (requested.includes(friendEmail)) {
      alert('Friend request already sent.');
      return;
    }
    if (pending.includes(friendEmail)) {
      alert('This user already sent you a request.');
      return;
    }

    try {
      await sendFriendRequest(user.uid, friendEmail.trim().toLowerCase());
      set((state) => ({
        requested: [...state.requested, friendEmail],
      }));
    } catch (error) {
      if (error.message === 'No user found with that email.') {
        alert('No account is registered with that email.');
      } else {
        alert(error.message || 'Failed to send request.');
      }
      console.error('Send request error:', error);
    }
  },

  acceptRequest: async (requesterEmail) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const requester = await getUserByEmail(requesterEmail);
      if (!requester) throw new Error('Requester not found');

      await acceptFriendRequest(user.uid, requester.uid);
      set((state) => ({
        pending: state.pending.filter((e) => e !== requesterEmail),
        friends: [...state.friends, requesterEmail],
      }));
    } catch (error) {
      console.error('Accept request error:', error);
      alert(error.message || 'Failed to accept request.');
    }
  },

  declineRequest: async (email) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const requester = await getUserByEmail(email);
      if (!requester) throw new Error('User not found');

      await Promise.all([
        updateDoc(doc(db, 'users', user.uid), {
          pending: arrayRemove(requester.uid),
        }),
        updateDoc(doc(db, 'users', requester.uid), {
          requested: arrayRemove(user.uid),
        }),
      ]);

      set((state) => ({
        pending: state.pending.filter((e) => e !== email),
      }));
    } catch (err) {
      console.error('Decline request error:', err);
      alert(err.message || 'Failed to decline request.');
    }
  },

  removeFriend: async (friendEmail) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const friend = await getUserByEmail(friendEmail);
      if (!friend) throw new Error('User not found');

      await removeFriend(user.uid, friend.uid);
      set((state) => ({
        friends: state.friends.filter((e) => e !== friendEmail),
      }));
    } catch (error) {
      console.error('Remove friend error:', error);
      alert(error.message || 'Failed to remove friend.');
    }
  },

  cleanUpRequested: async () => {
    const user = auth.currentUser;
    if (!user) return;

    const { requested } = get();
    const valid = [];

    for (const email of requested) {
      try {
        const target = await getUserByEmail(email);
        if (target && (target.pending || []).includes(user.uid)) {
          valid.push(email);
        }
      } catch (err) {
        console.warn(`Could not verify pending status for ${email}`);
      }
    }

    set({ requested: valid });
  },
}));
