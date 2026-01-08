// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBllQ41qL6LXlubX2ETcXbSAbRrd01jjpY",
  authDomain: "spin-it-55.firebaseapp.com",
  projectId: "spin-it-55",
  storageBucket: "spin-it-55.firebasestorage.app",
  messagingSenderId: "411192235597",
  appId: "1:411192235597:web:2b89010bb02a05ddf86e04",
  measurementId: "G-JF4NWN279R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };