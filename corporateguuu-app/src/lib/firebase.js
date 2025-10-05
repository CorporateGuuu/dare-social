// Firebase v9 Modular SDK
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";

// 🚨 DUMMY FIREBASE CONFIG
// --------------------------
// Do NOT commit real Firebase API keys here.
// This is only a placeholder. Each developer should create
// their own `.env` file (or use Expo's app.config.js)
// to load the real config securely.

// Copy your Firebase project settings from Firebase Console:
// Project Settings → General → Your apps → SDK setup & config

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Check for valid config
let auth, db, functions, storage;
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_api_key_here') {
  console.error('Firebase config is not properly set. Please update .env.local with real Firebase credentials.');
  auth = null;
  db = null;
  functions = null;
  storage = null;
} else {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app);
  storage = getStorage(app);
}

export { auth, db, functions, storage };

// ⚡ Connect to emulator in development
if (__DEV__ && functions) {
  try {
    connectFunctionsEmulator(functions, "localhost", 5001);
  } catch (e) {
    console.log("Emulator connection error", e);
  }
}

/* --------------------
   AUTH HELPERS
-------------------- */
export async function ensureSignedIn() {
  if (!auth) {
    console.warn('Firebase auth not initialized. Skipping sign in.');
    return null;
  }
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

export async function registerUserProfile(user) {
  if (!db) {
    console.warn('Firebase db not initialized. Skipping user profile registration.');
    return;
  }
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || "Anonymous",
      stoneBalance: 100,
      createdAt: serverTimestamp(),
    });
  }
}

/* --------------------
   FIRESTORE HELPERS
-------------------- */
export async function createDare({ title, description, rewardStone, creatorId }) {
  if (!db) {
    console.warn('Firebase db not initialized. Skipping createDare.');
    return null;
  }
  const docRef = await addDoc(collection(db, "dares"), {
    title,
    description,
    rewardStone,
    creatorId,
    status: "active",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function rewardUser(uid, rewardStone) {
  if (!functions) {
    console.warn('Firebase functions not initialized. Skipping rewardUser.');
    return;
  }
  try {
    const res = await updateStoneBalance({
      userId: uid,
      amount: rewardStone,
      type: "earn",
      description: "Completed dare"
    });
    console.log("New balance:", res.data.newBalance);
  } catch (e) {
    console.error("Transaction failed", e.message);
  }
}

/* --------------------
   STORAGE HELPERS
-------------------- */
export async function uploadProofMedia(uri, path) {
  if (!storage) {
    console.warn('Firebase storage not initialized. Skipping uploadProofMedia.');
    return null;
  }
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

/* --------------------
   CLOUD FUNCTION CALLS
-------------------- */
export function callAcceptDare(payload) {
  if (!functions) {
    console.warn('Firebase functions not initialized.');
    return Promise.reject('Firebase functions not available');
  }
  return httpsCallable(functions, "acceptDare")(payload);
}

export function callSubmitProof(payload) {
  if (!functions) {
    console.warn('Firebase functions not initialized.');
    return Promise.reject('Firebase functions not available');
  }
  return httpsCallable(functions, "submitProof")(payload);
}

export function callCompleteDare(payload) {
  if (!functions) {
    console.warn('Firebase functions not initialized.');
    return Promise.reject('Firebase functions not available');
  }
  return httpsCallable(functions, "completeDare")(payload);
}

export function updateStoneBalance(payload) {
  if (!functions) {
    console.warn('Firebase functions not initialized.');
    return Promise.reject('Firebase functions not available');
  }
  const call = httpsCallable(functions, "updateStoneBalance");
  return call(payload);
}
