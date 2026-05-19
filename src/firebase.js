import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA0WsZe7k5ONIPoCUnyWZkcSlcdkt9wH1k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smart-eb840.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smart-eb840",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smart-eb840.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "758962907142",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:758962907142:web:4de701ebf370208ef1bb87"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
