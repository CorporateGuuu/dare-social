import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";

export function useRealtimeLeaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("stoneBalance", "desc"),
      limit(10)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc, idx) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { users, loading };
}
