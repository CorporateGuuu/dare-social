import { getApp } from "firebase/app";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const app = getApp();
export const db = getFirestore(app);
export const functions = getFunctions(app);

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
