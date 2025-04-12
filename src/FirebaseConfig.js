import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import {
  getFunctions,
  connectFunctionsEmulator, // 🟢 ADD THIS
} from "firebase/functions";

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

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// ✅ THIS IS THE MISSING PART
const functions = getFunctions(app);
if (window.location.hostname === "localhost") {
  connectFunctionsEmulator(functions, "localhost", 5001); // Or use 5001 if that's your chosen port
}

// Auth providers
const providerGoogle = new GoogleAuthProvider();
const providerFacebook = new FacebookAuthProvider();

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Auth persistence set to local.");
  })
  .catch((error) => {
    console.error("❌ Error setting persistence:", error.message);
  });

export { auth, database, storage, providerGoogle, providerFacebook, functions };
