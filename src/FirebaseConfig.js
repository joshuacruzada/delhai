// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Import for Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAui3l_GNwRTNKIgU4RO0PcoGbrOp67xaA",
  authDomain: "auxiliary-5c15c.firebaseapp.com",
  databaseURL: "https://auxiliary-5c15c-default-rtdb.firebaseio.com/",
  projectId: "auxiliary-5c15c",
  storageBucket: "auxiliary-5c15c.appspot.com",
  messagingSenderId: "1079871483653",
  appId: "1:1079871483653:web:df25e3403ad2b737b9916c",
  measurementId: "G-PQ7W51D6SK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

export { database };
