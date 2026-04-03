import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTErBfG27j0-214G5-da-ZtJGZQFRXPl0",
  authDomain: "mallika-webdev.firebaseapp.com",
  projectId: "mallika-webdev",
  storageBucket: "mallika-webdev.firebasestorage.app",
  messagingSenderId: "166704629398",
  appId: "1:166704629398:web:4ac510d6176c5d491624b7",
  measurementId: "G-578578MJBR"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
const db = getFirestore(app)

// Initialize Auth
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { db, auth, googleProvider }
export default app
