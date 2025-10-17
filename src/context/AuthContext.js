import { doc, onSnapshot } from 'firebase/firestore';
import { createContext, useEffect, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '../config/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is authenticated (already signed in anonymously or with other method)
        const uid = firebaseUser.uid;
        // Update daily streak on login
        // Temporarily commented out to prevent crash
        // try {
        //   await updateDailyStreak();
        // } catch (error) {
        //   console.error('Error updating streak:', error);
        // }

        // Listen to user document with error handling for anonymous users
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
            // User document should be created on signUp, but if missing, set default
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
        }, (error) => {
          console.warn('Could not access user document (likely anonymous user, proceeding with defaults):', error.message);
          // For permission errors, proceed with default user data
          if (error.code === 'permission-denied') {
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
            setLoading(false);
          } else {
            console.error('Error fetching user document:', error);
            setUser(null);
            setLoading(false);
          }
        });

        return () => unsubscribeUser();
      } else {
        // No user authenticated, sign in anonymously for read access
        try {
          await signInAnonymously(auth);
          // The auth state change listener above will handle the new user
        } catch (error) {
          console.error('Failed to sign in anonymously:', error);
          setUser(null);
          setLoading(false);
        }
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
