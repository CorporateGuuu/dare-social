// components/NotificationsPanel.jsx
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "../config/firebase";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const ref = query(
      collection(db, "users", auth.currentUser.uid, "notifications"),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(ref, (snapshot) => {
      setNotifications(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="bg-[#0E0E0E] text-white p-4 rounded-xl border border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Notifications</h2>
      {notifications.map((n) => (
        <div
          key={n.id}
          className="border-b border-gray-800 py-3 text-sm text-gray-300"
        >
          <div className="font-medium text-white">{n.title}</div>
          <div>{n.body}</div>
          <div className="text-xs text-gray-500 mt-1">
            Expires: {new Date(n.expires_at.seconds * 1000).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
