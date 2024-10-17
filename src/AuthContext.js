import { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, push } from 'firebase/database';
import { auth, database } from './FirebaseConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // For UI blocking until auth state is known

  // Track the user's authentication state using Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const formattedUser = {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Anonymous User',
          email: currentUser.email,
        };
        setUser(formattedUser);
        localStorage.setItem('user', JSON.stringify(formattedUser));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false); // Stop the loading indicator
    });

    return () => unsubscribe(); // Clean up the listener on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Ignore the ESLint warning for missing dependency by disabling it

  const login = async (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      const auditLogEntry = {
        userId: userData.uid,
        userName: userData.name || 'Anonymous User',
        action: 'User Logged In',
        timestamp: new Date().toISOString(),
      };
      await push(ref(database, 'auditTrail/'), auditLogEntry);
    } catch (error) {
      console.error('Login failed:', error);
      alert('An error occurred during login. Please try again.');
    }
  };

  const logout = async () => {
    try {
      if (user) {
        // Create the audit log entry first, before clearing the user or signing out
        const auditLogEntry = {
          userId: user.uid,
          userName: user.name || 'Anonymous User',
          action: 'User Logged Out',
          timestamp: new Date().toISOString(),
        };
        await push(ref(database, 'auditTrail/'), auditLogEntry); // Push the log before signing out
      }

      // Now proceed to sign out the user
      await signOut(auth); // Firebase sign-out
      setUser(null); // Clear local user state
      localStorage.removeItem('user'); // Clear user from local storage
      window.location.assign('/login-page'); // Full page refresh for logout
    } catch (error) {
      console.error('Logout failed:', error);
      alert('An error occurred during logout. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Optional loading indicator while auth state is being determined
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
