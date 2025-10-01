import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";

// TODO: replace with your real config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "yourapp.firebaseapp.com",
  projectId: "yourapp",
  storageBucket: "yourapp.appspot.com",
  messagingSenderId: "0000000000",
  appId: "1:0000000000:web:xxxx",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// optional: connect to local emulator in dev
if (__DEV__) {
  try {
    // Only connect once
    connectFunctionsEmulator(functions, "localhost", 5001);
  } catch {}
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
