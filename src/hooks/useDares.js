import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "../config/firebase";

export function useDares() {
  const [dares, setDares] = useState([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "dares"), (snapshot) => {
      setDares(snapshot.docs.map((doc) => ({ dare_id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);
  return dares;
}
