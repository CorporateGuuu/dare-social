import { NavigationContainer } from '@react-navigation/native';
import { onValue, ref, update } from 'firebase/database';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from "react";
import { database, firestore } from "./src/config/firebase";
import { AuthContext, AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { generateReferralCode, getUserReferralData } from "./src/services/referralService";

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [userData, setUserData] = useState({
    stones: 0,
    transactions: [],
    referrals: { code: null, sent: 0, successful: 0 },
    loginStreak: { currentStreak: 0, maxStreak: 0, totalLogins: 0 },
    postStats: { totalPosts: 0, rewardedPosts: 0, totalPostEarnings: 0, dailyPostCount: 0 },
  });

  const [postStats, setPostStats] = useState({
    totalPosts: 0,
    rewardedPosts: 0,
    totalPostEarnings: 0,
    dailyPostCount: 0,
  });

  // Sync user data with Firebase Realtime Database
  useEffect(() => {
    if (user?.id) {
      const userRef = ref(database, `users/${user.id}`);

      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserData(prev => ({
            ...prev,
            stones: data.stonesBalance || 0,
            transactions: data.transactions || [],
            referrals: data.referrals || { code: null, sent: 0, successful: 0 },
            loginStreak: data.loginStreak || { currentStreak: 0, maxStreak: 0, totalLogins: 0 },
          }));
        }
      });

      return () => unsubscribe();
    }
  }, [user?.id]);

  // Listen to post stats with error handling
  useEffect(() => {
    if (user?.id) {
      const unsubscribe = onSnapshot(doc(firestore, 'users', user.id), (doc) => {
        const data = doc.data();
        if (data?.postStats) {
          setPostStats(data.postStats);
        }
      }, (error) => {
        if (error.code === 'permission-denied') {
          console.warn('Could not access user post stats (likely anonymous user):', error.message);
          // Proceed without post stats for anonymous users
        } else {
          console.error('Error fetching post stats:', error);
        }
      });
      return unsubscribe;
    }
  }, [user?.id]);

  // Update user data (triggers Cloud Function)
  const updateUserData = (updates) => {
    if (user?.id) {
      update(ref(database, `users/${user.id}`), updates);
    }
  };

  const fetchUserReferrals = async () => {
    try {
      const referralData = await getUserReferralData();
      setUserData(prev => ({
        ...prev,
        referrals: {
          ...prev.referrals,
          ...referralData
        }
      }));
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  };

  const processReferralReward = async (rewardAmount) => {
    // Implement referral reward processing logic
    console.log('Processing referral reward:', rewardAmount);
    // This could update user stones or other rewards via updateUserData
  };

  return (
    <AppContext.Provider value={{
      ...userData,
      postStats,
      setUserData: updateUserData,
      generateReferralCode,
      processReferralReward,
      fetchUserReferrals,
      // Keep legacy referral methods for compatibility
      referrals: userData.referrals,
      setReferrals: (updates) => setUserData(prev => ({
        ...prev,
        referrals: { ...prev.referrals, ...updates }
      }))
    }}>
      {children}
    </AppContext.Provider>
  );
};

function AppContent() {
  const { user } = useContext(AuthContext);
  return (
    <AppProvider>
      <NavigationContainer>
        <RootNavigator user={user} />
      </NavigationContainer>
    </AppProvider>
  );
}

export { AppContext };
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
