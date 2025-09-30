// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZfCpW_TklzEgDN4KEHFg9hEjZO8ChahA",
  authDomain: "aman-dc411.firebaseapp.com",
  projectId: "aman-dc411",
  storageBucket: "aman-dc411.firebasestorage.app",
  messagingSenderId: "229968414919",
  appId: "1:229968414919:web:0bb3c3c3763ca1a66496e2",
  measurementId: "G-WD9X4QG48C",
  databaseURL: "https://aman-dc411-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
