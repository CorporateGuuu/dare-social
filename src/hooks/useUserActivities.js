import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "../config/firebase";

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
          collection(firestore, "activities"),
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
