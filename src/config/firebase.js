import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";

// Replace with your Firebase config from console.firebase.google.com
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

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
