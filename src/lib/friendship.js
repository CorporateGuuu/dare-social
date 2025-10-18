import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../config/firebase";

export const handleFollow = async (targetId, isFollowing) => {
  const currentUserId = auth.currentUser.uid;

  if (isFollowing) {
    // Unfollow
    await deleteDoc(doc(db, "users", currentUserId, "following", targetId));
    await deleteDoc(doc(db, "users", targetId, "followers", currentUserId));
  } else {
    // Follow
    await setDoc(doc(db, "users", currentUserId, "following", targetId), {
      created_at: new Date().toISOString(),
    });
    await setDoc(doc(db, "users", targetId, "followers", currentUserId), {
      created_at: new Date().toISOString(),
    });
  }
};

export const isMutualFriend = async (userA, userB) => {
  const [aFollowsB, bFollowsA] = await Promise.all([
    getDoc(doc(db, "users", userA, "following", userB)),
    getDoc(doc(db, "users", userB, "following", userA)),
  ]);
  return aFollowsB.exists() && bFollowsA.exists();
};
