// Simple Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config - replace with your actual config from Firebase Console
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "sujaan-haat-ai.firebaseapp.com",
  projectId: "sujaan-haat-ai",
  storageBucket: "sujaan-haat-ai.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;