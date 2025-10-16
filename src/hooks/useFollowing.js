import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useFollowing(userId, followingId) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Listen for follow/unfollow changes in real-time
  useEffect(() => {
    if (!userId || !followingId) return;

    const followingRef = doc(db, 'users', userId, 'following', followingId);
    const unsubscribe = onSnapshot(followingRef, (doc) => {
      setIsFollowing(doc.exists());
    });

    return unsubscribe;
  }, [userId, followingId]);

  const toggleFollow = async () => {
    if (!userId || !followingId) return;
    setLoading(true);

    try {
      const followingRef = doc(db, 'users', userId, 'following', followingId);
      const followerRef = doc(db, 'users', followingId, 'followers', userId);

      if (isFollowing) {
        // Unfollow
        await deleteDoc(followingRef);
        await deleteDoc(followerRef);
      } else {
        // Follow
        await addDoc(collection(db, 'users', userId, 'following'), {
          id: followingId,
          followedAt: new Date()
        }).catch(() => {});
        await addDoc(collection(db, 'users', followingId, 'followers'), {
          id: userId,
          followedAt: new Date()
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return { isFollowing, loading, toggleFollow };
}
