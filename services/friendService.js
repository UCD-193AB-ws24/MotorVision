import { auth, db } from '../config/firebase';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from 'firebase/firestore';

/**
 * Get a user by email
 */
export async function getUserByEmail(email) {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { uid: doc.id, ...doc.data() };
  }
  return null;
}

/**
 * Send a friend request from current user to another email
 */
export async function sendFriendRequest(currentUserUid, friendEmail) {
  const friend = await getUserByEmail(friendEmail);
  if (!friend) throw new Error('No user found with that email.');
  if (currentUserUid === friend.uid) throw new Error("You can't add yourself.");

  await updateDoc(doc(db, 'users', currentUserUid), {
    requested: arrayUnion(friend.uid),
  });

  await updateDoc(doc(db, 'users', friend.uid), {
    pending: arrayUnion(currentUserUid),
  });

  return true;
}

/**
 * Accept a friend request (by email)
 */
export async function acceptFriendRequestByEmail(requesterEmail) {
  const currentUserUid = auth.currentUser?.uid;
  if (!currentUserUid) throw new Error('Not authenticated.');

  const requester = await getUserByEmail(requesterEmail);
  if (!requester) throw new Error('Requester not found.');
  if (currentUserUid === requester.uid) throw new Error("You can't accept yourself.");

  await updateDoc(doc(db, 'users', currentUserUid), {
    friends: arrayUnion(requester.uid),
    pending: arrayRemove(requester.uid),
  });

  await updateDoc(doc(db, 'users', requester.uid), {
    friends: arrayUnion(currentUserUid),
    requested: arrayRemove(currentUserUid),
  });

  return true;
}

/**
 * Accept a friend request (by UID)
 */
export async function acceptFriendRequest(currentUserUid, requesterUid) {
  await updateDoc(doc(db, 'users', currentUserUid), {
    friends: arrayUnion(requesterUid),
    pending: arrayRemove(requesterUid),
  });

  await updateDoc(doc(db, 'users', requesterUid), {
    friends: arrayUnion(currentUserUid),
    requested: arrayRemove(currentUserUid),
  });

  return true;
}

/**
 * Remove a friend from both users' lists
 */
export async function removeFriend(uid1, uid2) {
  await updateDoc(doc(db, 'users', uid1), {
    friends: arrayRemove(uid2),
  });

  await updateDoc(doc(db, 'users', uid2), {
    friends: arrayRemove(uid1),
  });
}

/**
 * Update user’s location
 */
export async function updateUserLocation(uid, location) {
  await updateDoc(doc(db, 'users', uid), {
    location: {
      lat: location.lat,
      lng: location.lng,
      timestamp: Date.now(),
    },
  });
}

/**
 * Get user location by email
 */
export async function getUserLocationByEmail(email) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error('User not found.');
  if (user.location?.lat && user.location?.lng) {
    return {
      lat: user.location.lat,
      lng: user.location.lng,
      timestamp: user.location.timestamp || null,
    };
  }
  return null;
}

/**
 * Get all friends’ locations
 */
export async function getFriendsLocations(currentUserUid) {
  const userRef = doc(db, 'users', currentUserUid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('User not found.');

  const friendUids = userSnap.data().friends || [];
  const locations = [];

  for (const uid of friendUids) {
    const friendSnap = await getDoc(doc(db, 'users', uid));
    if (friendSnap.exists()) {
      const friendData = friendSnap.data();
      if (friendData.email && friendData.location) {
        locations.push({
          email: friendData.email,
          location: {
            lat: friendData.location.lat,
            lng: friendData.location.lng,
            timestamp: friendData.location.timestamp || null,
            profileImage: friendData.profileImage || null // Optional: include profile image
          },
        });
      }
    }
  }

  return locations;
}
