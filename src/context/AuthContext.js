import { createContext, useCallback, useEffect, useState } from 'react';
import {
  getUserProfile,
  loginWithEmail,
  signOut as logoutUser,
  onAuthStateChanged,
  registerWithEmail,
  trackUserLogin
} from '../services/loginService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to handle user state changes
  const handleAuthStateChanged = useCallback(async (firebaseUser) => {
    setLoading(true);
    try {
      if (firebaseUser) {
        // Track user login and update streak
        try {
          await trackUserLogin(firebaseUser.uid);
        } catch (error) {
          console.error('Error tracking login:', error);
        }

        // Get user profile and set up real-time listener
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          setUser({
            id: firebaseUser.uid,
            email: userProfile.email,
            emailVerified: userProfile.emailVerified,
            username: userProfile.displayName || `@user_${firebaseUser.uid.slice(0, 6)}`,
            avatar: userProfile.photoURL || null,
            stones: userProfile.stoneBalance || 0,
            xp: userProfile.xp || 0,
            level: userProfile.level || 1,
            badges: userProfile.badges || [],
            currentStreak: userProfile.loginStreak?.currentStreak || 0,
            totalDaresCompleted: userProfile.totalDaresCompleted || 0,
            ...userProfile
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUser(null);
          await logoutUser();
        }
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
    const unsubscribe = onAuthStateChanged(handleAuthStateChanged);
    return () => unsubscribe();
  }, [handleAuthStateChanged]);

  // Login function
  const login = async (email, password) => {
    return loginWithEmail(email, password);
  };

  // Register function
  const register = async (email, password, additionalData = {}) => {
    return registerWithEmail(email, password, additionalData);
  };

  // Logout function
  const logout = async () => {
    setUser(null);
    return logoutUser();
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