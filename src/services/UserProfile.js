import { database } from '../FirebaseConfig';
import { ref, get } from 'firebase/database';

export const fetchUserProfile = async (uid) => {
  const userRef = ref(database, `users/${uid}`);
  try {
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return snapshot.val(); // Return user profile data
    } else {
      console.warn(`User with UID ${uid} not found.`);
      return { name: 'Unknown User', role: 'Unknown Role' }; // Fallback values
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { name: 'Unknown User', role: 'Unknown Role' }; // Fallback values
  }
};
