import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase } from 'firebase/database';
import { getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";

// Replace with your Firebase config from console.firebase.google.com
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "dummy_api_key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy_auth_domain",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "dummy_project_id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy_storage_bucket",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "dummy_messaging_sender_id",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "dummy_app_id",

};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

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
console.log(auth)
export { auth };

export const firestore = getFirestore(app);
export const database = getDatabase(app);
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
    const currentUser = auth.currentUser;
    if (currentUser) {
      resolve(currentUser);
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsub();
        resolve(user);
      }
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
