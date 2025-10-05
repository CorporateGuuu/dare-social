import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "yourapp.firebaseapp.com",
  projectId: "yourapp",
  storageBucket: "yourapp.appspot.com",
  messagingSenderId: "0000000000",
  appId: "1:0000000000:web:xxxx"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// auto sign-in
export async function ensureSignedIn() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) await signInAnonymously(auth);
      unsub();
      resolve(auth.currentUser);
    });
  });
}

// Cloud Functions
export const listDares = httpsCallable(functions, "listDares");
export const listCompletedDares = httpsCallable(functions, "listCompletedDares");
export const getUserById = httpsCallable(functions, "getUserById");
export const acceptDare = httpsCallable(functions, "acceptDare");
export const submitProof = httpsCallable(functions, "submitProof");
export const castVote = httpsCallable(functions, "castVote");
export const completeDare = httpsCallable(functions, "completeDare");
export const updateStoneBalance = httpsCallable(functions, "updateStoneBalance");
export const updateDailyStreak = httpsCallable(functions, "updateDailyStreak");
export const searchUsers = httpsCallable(functions, "searchUsers");
export const getFrequentChallengers = httpsCallable(functions, "getFrequentChallengers");
