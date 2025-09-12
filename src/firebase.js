// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyACMYOmD5BLqNMVhsZzRTVYX-M6DDOYiio",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kundalini-app-59541.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kundalini-app-59541",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kundalini-app-59541.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "27778148977",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:27778148977:web:a86e7db0c6edeaf6c3c9d0"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)