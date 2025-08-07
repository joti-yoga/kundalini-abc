// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore' // ← 必須加這行！

const firebaseConfig = {
  apiKey: "AIzaSyACMYOmD5BLqNMVhsZzRTVYX-M6DDOYiio",
  authDomain: "kundalini-app-59541.firebaseapp.com",
  projectId: "kundalini-app-59541",
  storageBucket: "kundalini-app-59541.firebasestorage.app",
  messagingSenderId: "27778148977",
  appId: "1:27778148977:web:a86e7db0c6edeaf6c3c9d0"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)