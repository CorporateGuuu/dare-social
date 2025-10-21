import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

export function useFriendStatsList(userId) {
  const [pairs, setPairs] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // Query for pairs where the current user is either userA or userB
    const pairsRef = collection(db, "friend_stats");
    const q = query(
      pairsRef,
      where("userA", "==", userId)
    );

    const q2 = query(
      pairsRef,
      where("userB", "==", userId)
    );

    const unsub1 = onSnapshot(q, (snapshot) => {
      const userAPairs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPairs(prevPairs => {
        const filteredPrev = prevPairs.filter(p => p.userB !== userId);
        return [...filteredPrev, ...userAPairs];
      });
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
      const userBPairs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPairs(prevPairs => {
        const filteredPrev = prevPairs.filter(p => p.userA !== userId);
        return [...filteredPrev, ...userBPairs];
      });
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [userId]);

  return pairs;
}

export function useFriendStats(userA, userB) {
  const [pair, setPair] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userA || !userB) return;

    setLoading(true);
    // Sort IDs for consistent lookup
    const [sortedA, sortedB] = [userA, userB].sort();
    const pairId = `${sortedA}_${sortedB}`;

    const pairRef = collection(db, "friend_stats").doc(pairId);
    const unsub = onSnapshot(pairRef, (doc) => {
      if (doc.exists) {
        setPair({ id: doc.id, ...doc.data() });
      } else {
        // Pair doesn't exist yet - create default structure for display
        setPair({
          userA: sortedA,
          userB: sortedB,
          total_dares: 0,
          current_streak: 0,
          last_dare_date: null
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [userA, userB]);

  return { pair, loading };
}
