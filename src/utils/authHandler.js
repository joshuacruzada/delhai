import { ref, push, get } from 'firebase/database';
import { database } from '../FirebaseConfig';
import { getAuth } from 'firebase/auth';

export const handleLogin = async (role, userId, userName) => {
  localStorage.setItem('authToken', 'your-token');
  localStorage.setItem('userRole', role);
  localStorage.setItem('userId', userId);
  localStorage.setItem('userName', userName);

  const auditRef = ref(database, 'auditTrail/');
  const auditLogEntry = {
    userId,
    userName,
    action: 'User Logged In',
    timestamp: new Date().toISOString(),
  };

  try {
    await push(auditRef, auditLogEntry);
  } catch (error) {
    console.error('Login audit failed:', error);
  }
};

export const handleLogout = async () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  let userId = null;
  let userName = null;

  if (currentUser) {
    userId = currentUser.uid;

    try {
      const snapshot = await get(ref(database, `users/${userId}`));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        userName = userData.name || 'Unknown User';
      }
    } catch (error) {
      console.error('Logout fetch user error:', error);
    }
  }

  const auditLogEntry = {
    userId: userId || 'Unknown ID',
    userName: userName || 'Unknown User',
    action: 'User Logged Out',
    timestamp: new Date().toISOString(),
  };

  try {
    await push(ref(database, 'auditTrail/'), auditLogEntry);
    localStorage.clear();
    window.location.assign('/login-page');
  } catch (error) {
    console.error('Logout audit failed:', error);
  }
};
