import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db, auth } from "../config/firebase";

export function useBestFriends() {
  const [bestFriends, setBestFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "friend_stats"),
      where("pair_ids", "array-contains", userId),
      orderBy("total_dares", "desc"),
      limit(5)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const friends = snapshot.docs.map((doc) => {
        const data = doc.data();
        const friendId = data.userA === userId ? data.userB : data.userA;
        return { friendId, ...data };
      });
      setBestFriends(friends);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching best friends:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { bestFriends, loading };
}
