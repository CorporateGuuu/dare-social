// src/hooks/useChatRoom.js
import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection, doc, addDoc, query, orderBy, onSnapshot, serverTimestamp, setDoc, where, Timestamp,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "../lib/firebase";

export function useChatRoom(roomId) {
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingRef = useRef(null);

  // live room meta
  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, "chatRooms", roomId), (snap) => setRoom({ id: snap.id, ...snap.data() }));
    return () => unsub();
  }, [roomId]);

  // live messages
  useEffect(() => {
    if (!roomId) return;
    const q = query(collection(db, "chatRooms", roomId, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [roomId]);

  // live typing indicators
  useEffect(() => {
    if (!roomId) return;
    const now = Timestamp.now();
    const threeSecondsAgo = new Timestamp(now.seconds - 3, now.nanoseconds);
    const q = query(
      collection(db, "chatRooms", roomId, "typing"),
      where("isTyping", "==", true),
      where("updatedAt", ">", threeSecondsAgo)
    );
    const unsub = onSnapshot(q, (snap) => {
      const users = snap.docs.map((d) => d.id);
      setTypingUsers(users);
    });
    return () => unsub();
  }, [roomId]);

  // send message through function or direct write
  const sendMessageFn = httpsCallable(functions, "sendMessage");
  async function sendMessage({ text, mediaUrl = null }) {
    await sendMessageFn({ roomId, text: text || null, mediaUrl });
  }

  // typing indicator (self)
  async function setTyping(isTyping) {
    if (!roomId || !auth.currentUser) return;
    const ref = doc(db, "chatRooms", roomId, "typing", auth.currentUser.uid);
    await setDoc(ref, { isTyping, updatedAt: serverTimestamp() }, { merge: true });
  }

  // read receipt (mark latest read)
  const markRoomReadFn = httpsCallable(functions, "markRoomRead");
  async function markRead() {
    if (!roomId) return;
    await markRoomReadFn({ roomId });
  }

  // other participant id
  const otherId = useMemo(() => {
    const me = auth.currentUser?.uid;
    return room?.participants?.find((p) => p !== me);
  }, [room, auth.currentUser?.uid]);

  // is other participant typing
  const isOtherTyping = useMemo(() => {
    return typingUsers.includes(otherId);
  }, [typingUsers, otherId]);

  return { room, messages, loading, sendMessage, setTyping, markRead, otherId, isOtherTyping };
}
