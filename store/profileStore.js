import { create } from 'zustand';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  getUserByEmail,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend
} from '../services/friendService';

export const useProfileStore = create((set, get) => ({
  name: '',
  email: '',
  friends: [],
  pending: [],
  requested: [],

  setName: (newName) => set({ name: newName }),
  setEmail: (newEmail) => set({ email: newEmail }),

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
      fetchEmails(data.requested || [])
    ]);

    set({
      name: data.name || '',
      email: data.email || '',
      friends: friendEmails,
      pending: pendingEmails,
      requested: requestedEmails,
    });
  },

  /**
   * Send a friend request by email with client-side checks
   */
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
      await sendFriendRequest(user.uid, friendEmail);
      set((state) => ({
        requested: [...state.requested, friendEmail],
      }));
    } catch (error) {
      console.error('Send request error:', error);
      alert(error.message || 'Failed to send request.');
    }
  },

  /**
   * Accept a pending request by email
   */
  acceptRequest: async (requesterEmail) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const requester = await getUserByEmail(requesterEmail);
      if (!requester) throw new Error("Requester not found");

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

  /**
   * Decline a pending friend request locally
   */
  declineRequest: (email) => {
    set((state) => ({
      pending: state.pending.filter((e) => e !== email),
    }));
  },

  /**
   * Remove an existing friend (mutual removal)
   */
  removeFriend: async (friendEmail) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const friend = await getUserByEmail(friendEmail);
      if (!friend) throw new Error("User not found");

      await removeFriend(user.uid, friend.uid);
      set((state) => ({
        friends: state.friends.filter((e) => e !== friendEmail),
      }));
    } catch (error) {
      console.error('Remove friend error:', error);
      alert(error.message || 'Failed to remove friend.');
    }
  },
}));
