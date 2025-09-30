// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

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
const db = getFirestore(app); // Firestore instance
const rtdb = getDatabase(app); // Realtime Database instance

// Enable offline persistence for Firestore.
// This should be done only once, so we check if the app is initialized.
if (typeof window !== 'undefined' && !getApps().length) {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence failed: The current browser does not support all of the features required to enable persistence.');
    }
  });
}


export { app, auth, db, rtdb };
