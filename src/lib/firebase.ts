// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZfCpW_TklzEgDN4KEHFg9hEjZO8ChahA",
  authDomain: "aman-dc411.firebaseapp.com",
  projectId: "aman-dc411",
  storageBucket: "aman-dc411.firebasestorage.app",
  messagingSenderId: "229968414919",
  appId: "1:229968414919:web:0bb3c3c3763ca1a66496e2",
  measurementId: "G-WD9X4QG48C"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db);
} catch (err: any) {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one.
    // Silently fail.
  } else if (err.code === 'unimplemented') {
    // The current browser does not support all of the
    // features required to enable persistence
  }
}


export { app, auth, db };
