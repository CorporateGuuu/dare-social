import { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { collection, onSnapshot, doc, onSnapshot as onDoc } from "firebase/firestore";

export function useBadges() {
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setBadges([]);
      setStats(null);
      return;
    }

    const unsubBadges = onSnapshot(collection(db, "users", uid, "badges"), (snap) => {
      setBadges(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubStats = onDoc(doc(db, "users", uid), (snap) => setStats(snap.data()?.stats || null));
    return () => {
      unsubBadges?.();
      unsubStats?.();
    };
  }, []);

  return { badges, stats };
}
