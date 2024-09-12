// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Import the Realtime Database module
import { getStorage } from "firebase/storage"; // Import Firebase Storage module

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAm6_V2n5ArhWDNMqWThKY9IS2NLi_O4X4",
  authDomain: "delhai-database.firebaseapp.com",
  databaseURL: "https://delhai-database-default-rtdb.firebaseio.com",
  projectId: "delhai-database",
  storageBucket: "delhai-database.appspot.com", // Make sure this is correctly set
  messagingSenderId: "719302477505",
  appId: "1:719302477505:web:8ae03608f25b90d7e83640",
  measurementId: "G-PYSLZ5KZLZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Initialize Firebase Storage and get a reference to the service
const storage = getStorage(app);

export { database, storage }; // Export both database and storage
