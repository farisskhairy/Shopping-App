import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Web app's Firebase configuration from .env

const firebaseConfig = {
  apiKey: "AIzaSyCbpS83dofSEQ2zN3jc2RVy6cjH-lLRVG8",
  authDomain: "cs-467-shopping-app.firebaseapp.com",
  projectId: "cs-467-shopping-app",
  storageBucket: "cs-467-shopping-app.appspot.com",
  messagingSenderId: "817998367509",
  appId: "1:817998367509:web:e4d570291457a364f8b71c",
  measurementId: "G-13KYQL100F"
};

// Initialize app  
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };