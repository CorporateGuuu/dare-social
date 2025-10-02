import { doc, onSnapshot } from 'firebase/firestore';
import { createContext, useEffect, useState } from 'react';
import { auth, db, updateDailyStreak } from '../lib/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        // Update daily streak on login
        try {
          await updateDailyStreak();
        } catch (error) {
          console.error('Error updating streak:', error);
        }

        // Listen to user document
        const userDocRef = doc(db, 'users', uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              id: uid,
              username: userData.displayName || `@user_${uid.slice(0, 6)}`,
              avatar: userData.photoURL || null,
              stones: userData.stoneBalance || 0,
              xp: userData.xp || 0,
              level: userData.level || 1,
              badges: userData.badges || [],
              currentStreak: userData.currentStreak || 0,
              totalDaresCompleted: userData.totalDaresCompleted || 0,
              ...userData
            });
          } else {
            // Create user document if it doesn't exist
            setUser({
              id: uid,
              username: `@user_${uid.slice(0, 6)}`,
              stones: 0,
              xp: 0,
              level: 1,
              badges: [],
              currentStreak: 0,
              totalDaresCompleted: 0,
            });
          }
          setLoading(false);
        });

        return () => unsubscribeUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const logout = () => {
    auth.signOut();
  };

  const setTyping = (challengeId, isTyping) => {
    console.log(`User ${user?.id} ${isTyping ? 'started' : 'stopped'} typing in ${challengeId}`);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, setTyping, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
