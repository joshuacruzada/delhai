// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAm6_V2n5ArhWDNMqWThKY9IS2NLi_O4X4",
  authDomain: "delhai-database.firebaseapp.com",
  databaseURL: "https://delhai-database-default-rtdb.firebaseio.com",
  projectId: "delhai-database",
  storageBucket: "delhai-database.appspot.com",
  messagingSenderId: "719302477505",
  appId: "1:719302477505:web:8ae03608f25b90d7e83640",
  measurementId: "G-PYSLZ5KZLZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// ✅ Enable persistence to avoid session issues
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Auth persistence set to local.');
  })
  .catch((error) => {
    console.error('❌ Error setting persistence:', error.message);
  });

export { auth, database, storage };
