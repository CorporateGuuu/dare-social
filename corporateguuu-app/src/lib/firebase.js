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

// ⚡ Replace with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "yourapp.firebaseapp.com",
  projectId: "yourapp",
  storageBucket: "yourapp.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxx",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// ⚡ Connect to emulator in development
if (__DEV__) {
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

/* --------------------
   STORAGE HELPERS
-------------------- */
export async function uploadProofMedia(uri, path) {
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
  return httpsCallable(functions, "acceptDare")(payload);
}

export function callSubmitProof(payload) {
  return httpsCallable(functions, "submitProof")(payload);
}

export function callCompleteDare(payload) {
  return httpsCallable(functions, "completeDare")(payload);
}
