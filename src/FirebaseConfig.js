// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
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

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firebase Realtime Database
const database = getDatabase(app);

// Initialize Firebase Storage
const storage = getStorage(app);

export { auth, database, storage };
