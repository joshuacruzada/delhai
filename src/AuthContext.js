import { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, push } from 'firebase/database';
import { auth, database } from './FirebaseConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Track the user's authentication state using Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const formattedUser = {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Anonymous User',
          email: currentUser.email,
        };
        setUser(formattedUser);
        try {
          localStorage.setItem('user', JSON.stringify(formattedUser));
        } catch (error) {
          console.error('Failed to store user in localStorage:', error);
        }
      } else {
        setUser(null);
        try {
          localStorage.removeItem('user');
        } catch (error) {
          console.error('Failed to remove user from localStorage:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Ensure cleanup on unmount
  }, []);

  // ✅ Handle Login
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

  // ✅ Handle Logout
  const logout = async () => {
    try {
      if (user) {
        const auditLogEntry = {
          userId: user.uid,
          userName: user.name || 'Anonymous User',
          action: 'User Logged Out',
          timestamp: new Date().toISOString(),
        };
        await push(ref(database, 'auditTrail/'), auditLogEntry);
      }

      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
      window.location.assign('/login-page');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('An error occurred during logout. Please try again.');
    }
  };

  // ✅ Display Loading State
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h3>Loading...</h3>
      </div>
    );
  }

  // ✅ Provide Context Values
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
