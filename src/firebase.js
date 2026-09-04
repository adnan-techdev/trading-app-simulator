import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBMCPLrkVtXH2V_9kv-q23PKOqxBGvsGi4",
  authDomain: "trading-app-simulator.firebaseapp.com",
  projectId: "trading-app-simulator",
  storageBucket: "trading-app-simulator.firebasestorage.app",
  messagingSenderId: "719635541330",
  appId: "1:719635541330:web:e4769945d1ee81242ede8b",
  measurementId: "G-JVEK2ZV8R0",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const analytics = isSupported().then((supported) => (supported ? getAnalytics(firebaseApp) : null));