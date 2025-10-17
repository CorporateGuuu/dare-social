import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

/** Hook to fetch user's activities for profile */
export function useUserActivities(userId, maxItems = 5) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserActivities = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const q = query(
          collection(db, "activities"),
          where("actorId", "==", userId),
          orderBy("createdAt", "desc"),
          limit(maxItems)
        );

        const querySnapshot = await getDocs(q);
        const fetchedActivities = [];

        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          const activity = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          };
          fetchedActivities.push(activity);
        }

        setActivities(fetchedActivities);
      } catch (error) {
        console.error("Error fetching user activities:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserActivities();
  }, [userId, maxItems]);

  return { activities, loading };
}
