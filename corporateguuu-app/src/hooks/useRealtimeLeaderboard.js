import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";

export function useRealtimeLeaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      console.warn("Firestore not initialized. Skipping leaderboard query.");
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users"),
      orderBy("stoneBalance", "desc"),
      limit(10)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc, idx) => ({
        uid: doc.id,
        rank: idx + 1,
        ...doc.data(),
      }));
      setUsers(data);
      setLoading(false);
    }, (error) => {
      console.error("Error in leaderboard snapshot:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { users, loading };
}
