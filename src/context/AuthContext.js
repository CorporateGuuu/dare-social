import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { createContext, useCallback, useEffect, useState } from 'react';
import { auth, firestore } from '../config/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to handle user state changes
  const handleAuthStateChanged = useCallback(async (firebaseUser) => {
    setLoading(true);
    try {
      if (firebaseUser) {
        
        const uid = firebaseUser.uid;
        // Update daily streak on login
        // Temporarily commented out to prevent crash
        // try {
        //   await updateDailyStreak();
        // } catch (error) {
        //   console.error('Error updating streak:', error);
        // }

        // Listen to user document with error handling for anonymous users
        const userDocRef = doc(firestore, 'users', uid);
        
        // Set up real-time listener for user document
        const unsubscribeUser = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setUser({
                id: uid,
                email: userData.email,
                emailVerified: userData.emailVerified,
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
              console.warn('User document not found for user:', uid);
              setUser(null);
              signOut(auth);
            }
          },
          (error) => {
            console.error('Error listening to user document:', error);
            setUser(null);
          }
        );

        return () => unsubscribeUser();
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error in auth state change:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);
    return () => unsubscribe();
  }, [handleAuthStateChanged]);

  // Login function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};