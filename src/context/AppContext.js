import { doc, onSnapshot } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from "react";
import { firestore } from "../config/firebase";
import { generateReferralCode } from "../services/referralService";
import { AuthContext } from "./AuthContext";

const AppContext = React.createContext();

const AppProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [postStats, setPostStats] = useState({
    totalPosts: 0,
    rewardedPosts: 0,
    totalPostEarnings: 0,
    dailyPostCount: 0,
  });
  const [referralData, setReferralData] = useState({
    code: null,
    referrals: {
      totalReferrals: 0,
      totalReferralEarnings: 0,
    }
  });

  // Listen to post stats with error handling
  useEffect(() => {
    if (user?.id) {

      const unsubscribe = onSnapshot(doc(firestore, 'users', user.id), (snapshot) => {
        const data = snapshot.data();
        if (data?.postStats) {
          setPostStats(data.postStats)
        }
      }, (error) => {
        if(error.code === 'permission-denied') {
          console.warn('Could not access user post stats (likely anonymous user):', error.message);
          // Proceed without post stats for anonymous users
        } else {
          console.error('Error fetching post stats:', error);
        }
      }
    );
      return () => unsubscribe();
    }
  }, [user?.id]);

  // Update user data (triggers Cloud Function)
  const updateUserData = (updates) => {
    if (user?.id) {
      console.log("TODO: Update user data using cloud function with updates:", updates);

      if (updates?.referrals) {
        setReferralData(prev => ({
          ...prev,
          referrals: {
            ...prev.referrals,
            ...updates.referrals
          }
        }));
      }
    }
  };

  const fetchUserReferrals = async () => {
    if (!user?.id) return;
    
    try {
      // Mock data for development
      const mockReferralData = {
        code: user.id.slice(0, 8).toUpperCase(), // Generate a simple code from user ID
        sent: 0,
        successful: 0
      };
      
      setReferralData(mockReferralData);
      return mockReferralData;
    } catch (error) {
      console.error('Error in fetchUserReferrals:', error);
      return null;
    }
  };

  const processReferralReward = async (rewardAmount) => {
    // Implement referral reward processing logic
    console.log('Processing referral reward:', rewardAmount);
    // This could update user stones or other rewards via updateUserData
  };

  return (
    <AppContext.Provider value={{
      postStats,
      setPostStats,
      generateReferralCode,
      processReferralReward,
      fetchUserReferrals,
      // Keep legacy referral methods for compatibility
      referrals: referralData.referrals,
      setReferrals: (updates) => setReferralData(prev => ({
        ...prev,
        referrals: { ...prev.referrals, ...updates }
      }))
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
