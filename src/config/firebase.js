import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';
import { initializeAuth, getAuth, getReactNativePersistence, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your Firebase config from console.firebase.google.com
const firebaseConfig = {
  apiKey: "AIzaSyBqWXnD-cbovdoeE96atVXwUABFICFliRU",
  authDomain: "abstrac-8e36e.firebaseapp.com",
  databaseURL: "https://abstrac-8e36e-default-rtdb.firebaseio.com/",
  projectId: "abstrac-8e36e",
  storageBucket: "abstrac-8e36e.firebasestorage.app",
  messagingSenderId: "630430127671",
  appId: "1:630430127671:web:6159fcfd806118b15e51b2",
  measurementId: "G-5RFNQZ7XCQ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const database = getDatabase(app);
export { analytics };

// Initialize auth only once - prevent HMR reinitialization
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  console.warn('Auth already initialized:', error);
  auth = getAuth(app);
}
export { auth };

export const db = getFirestore(app);
export const functions = getFunctions(app);

// optional: connect to local emulator in dev
if (__DEV__) {
  try {
    // Only connect once
    console.log('Connecting to Firebase functions emulator...');
    connectFunctionsEmulator(functions, "localhost", 5001);
  } catch (error) {
    console.log('Functions emulator connection failed:', error.message);
  }
}

export async function ensureSignedIn() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        await signInAnonymously(auth);
      }
      unsub();
      resolve(auth.currentUser);
    });
  });
}

// helpers for callable functions
export function callAcceptDare(payload) {
  return httpsCallable(functions, "acceptDare")(payload);
}
export function callSubmitProof(payload) {
  return httpsCallable(functions, "submitProof")(payload);
}
export function callCompleteDare(payload) {
  return httpsCallable(functions, "completeDare")(payload);
}
export function callGetBet(payload) {
  return httpsCallable(functions, "getBet")(payload);
}
