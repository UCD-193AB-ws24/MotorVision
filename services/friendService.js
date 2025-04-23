// friendsService.js

import { auth, db } from '../config/firebase';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

/**
 * Get a user by their email
 * @param {string} email
 * @returns {Promise<{uid: string, ...userData}>}
 */
export async function getUserByEmail(email) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { uid: doc.id, ...doc.data() };
  } else {
    return null;
  }
}

/**
 * Send a friend request from currentUser to friend by email
 * @param {string} currentUserUid
 * @param {string} friendEmail
 * @returns {Promise<boolean>}
 */
export async function sendFriendRequest(currentUserUid, friendEmail) {
  const friend = await getUserByEmail(friendEmail);
  if (!friend) throw new Error("No user found with that email.");

  const friendUid = friend.uid;

  if (currentUserUid === friendUid) throw new Error("You can't add yourself.");

  await updateDoc(doc(db, `users/${currentUserUid}`), {
    requested: arrayUnion(friendUid)
  });

  await updateDoc(doc(db, `users/${friendUid}`), {
    pending: arrayUnion(currentUserUid)
  });

  return true;
}

/**
 * Accept a friend request using emails
 * @param {string} requesterEmail
 * @returns {Promise<boolean>}
 */
export async function acceptFriendRequestByEmail(requesterEmail) {
  const currentUserUid = auth.currentUser?.uid;
  if (!currentUserUid) throw new Error("Not authenticated.");

  const requester = await getUserByEmail(requesterEmail);
  if (!requester) throw new Error("Requester not found.");

  const requesterUid = requester.uid;

  if (currentUserUid === requesterUid) {
    throw new Error("You can't accept a request from yourself.");
  }

  await updateDoc(doc(db, `users/${currentUserUid}`), {
    friends: arrayUnion(requesterUid),
    pending: arrayRemove(requesterUid)
  });

  await updateDoc(doc(db, `users/${requesterUid}`), {
    friends: arrayUnion(currentUserUid),
    requested: arrayRemove(currentUserUid)
  });

  return true;
}

/**
 * Accept a friend request using UIDs
 * @param {string} currentUserUid
 * @param {string} requesterUid
 * @returns {Promise<boolean>}
 */
export async function acceptFriendRequest(currentUserUid, requesterUid) {
  await updateDoc(doc(db, `users/${currentUserUid}`), {
    friends: arrayUnion(requesterUid),
    pending: arrayRemove(requesterUid)
  });

  await updateDoc(doc(db, `users/${requesterUid}`), {
    friends: arrayUnion(currentUserUid),
    requested: arrayRemove(currentUserUid)
  });

  return true;
}

/**
 * Remove a friend (mutual removal from friends arrays)
 * @param {string} uid1
 * @param {string} uid2
 * @returns {Promise<void>}
 */
export async function removeFriend(uid1, uid2) {
  await updateDoc(doc(db, `users/${uid1}`), {
    friends: arrayRemove(uid2)
  });

  await updateDoc(doc(db, `users/${uid2}`), {
    friends: arrayRemove(uid1)
  });
}

/**
 * Update a user's current location in Firestore
 * @param {string} uid
 * @param {{lat: number, lng: number}} location
 * @returns {Promise<void>}
 */
export async function updateUserLocation(uid, location) {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    location: {
      lat: location.lat,
      lng: location.lng,
      timestamp: Date.now()
    }
  });
}

/**
 * Get a user's location by their email
 * @param {string} email
 * @returns {Promise<{lat: number, lng: number, timestamp?: number} | null>}
 */
export async function getUserLocationByEmail(email) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error("User not found.");

  if (user.location && user.location.lat && user.location.lng) {
    return {
      lat: user.location.lat,
      lng: user.location.lng,
      timestamp: user.location.timestamp || null
    };
  } else {
    return null;
  }
}
