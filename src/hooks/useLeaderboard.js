import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";

export function useLeaderboard(weekId) {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!weekId) return;

    async function fetchBoard() {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, "leaderboard", weekId));
        if (snap.exists()) {
          setBoard(snap.data());
        } else {
          setBoard(null);
        }
      } catch (err) {
        setError(err);
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBoard();
  }, [weekId]);

  return { board, loading, error };
}
