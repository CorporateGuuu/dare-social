import {
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc
} from 'firebase/firestore';
import { auth, firestore } from '../config/firebase';

// User management functions
export const createUserProfile = async (user, additionalData = {}) => {
  const userRef = doc(firestore, 'users', user.uid);
  
  const userData = {
    id: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    username: user.username || `@user_${user.uid.slice(0, 6)}`,
    avatar: user.avatar || null,
    stones: 0,
    xp: 0,
    level: 1,
    badges: [],
    totalDaresCompleted: 0,
    loginStreak: {
      currentStreak: 0,
      lastLogin: new Date(),
      totalLogins: 1,
      maxStreak: 0
    },
    createdAt: new Date(),
    login_rewards: [],
    ...additionalData
  };

  await setDoc(userRef, userData);
  return userData;
};

export const getUserProfile = async (userId) => {
  const userRef = doc(firestore, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  return { id: userDoc.id, ...userDoc.data() };
};

// Auth state management
export const onAuthStateChanged = (callback) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

// Authentication functions
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const registerWithEmail = async (email, password, additionalData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(userCredential.user, additionalData);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login streak and rewards
export const trackUserLogin = async (userId) => {
  try {
    console.log('Tracking user login for user:', userId)
    const now = new Date();
    const userRef = doc(firestore, 'users', userId);
    await runTransaction(firestore, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw new Error('User does not exist');
      }

      const userData = userDoc.data();
      const { stones, loginStreak } = userData;
      const { lastLogin, totalLogins, maxStreak, currentStreak } = loginStreak || {
        lastLogin: null,
        totalLogins: 0,
        maxStreak: 0,
        currentStreak: 0
      };

      // Calculate days since last login
      const lastLoginDate = lastLogin ? new Date(lastLogin.seconds * 1000 || lastLogin.toDate()) : null;
      const daysSinceLastLogin = lastLoginDate 
        ? Math.floor((now - lastLoginDate) / (1000 * 60 * 60 * 24))
        : Infinity; // First login

      let newCurrentStreak = currentStreak;
      let newMaxStreak = maxStreak;

      // Update streak logic
      if (daysSinceLastLogin === 1) {
        // If user logged in yesterday, increment streaks
        newCurrentStreak = (currentStreak || 0) + 1;
        newMaxStreak = Math.max(newMaxStreak || 0, newCurrentStreak);
      } else if (daysSinceLastLogin > 1 || daysSinceLastLogin === Infinity) {
        // If user logged in after a gap of more than a day, reset streaks
        newCurrentStreak = 1;
      } else if (daysSinceLastLogin === 0) {
        // Same day login, no changes
        return;
      }
      // Calculate rewards
      const baseReward = 5;

      // Calculate streak bonus (1 stone per streak day, up to 10)
      const streakBonus = Math.min(newCurrentStreak, 10);

      // Total reward
      const totalReward = baseReward + streakBonus;

      // Check if daily reward was already claimed today
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let canClaimReward = true;
      if (userData.dailyRewardLastClaimed) {
        const lastClaimDate = new Date(userData.dailyRewardLastClaimed.seconds * 1000 || userData.dailyRewardLastClaimed.toDate());
        const lastClaimDay = new Date(lastClaimDate.getFullYear(), lastClaimDate.getMonth(), lastClaimDate.getDate());
        if (today.getTime() === lastClaimDay.getTime()) {
          canClaimReward = false;
        }
      }

      // Update user document
      const updatedLoginStreak = {
        currentStreak: newCurrentStreak,
        lastLogin: now,
        totalLogins: (totalLogins || 0) + 1,
        maxStreak: newMaxStreak
      };
      const loginEarnings = userData.loginEarnings || 0;
      const updates = {
        loginStreak: updatedLoginStreak,
        stones: (stones || 0) + (canClaimReward ? totalReward : 0),
        loginEarnings: (loginEarnings || 0) + (canClaimReward ? totalReward : 0),
        ...(canClaimReward && { dailyRewardLastClaimed: now })
      };
      transaction.update(userRef, updates);

      // Add login reward document to subcollection if reward claimed
      if (canClaimReward) {
        const dateId = new Date().toISOString().split('T')[0];
        const loginRewardsRef = collection(userRef, 'login_rewards');

         await setDoc(doc(loginRewardsRef, dateId), {
          loginDate: now,
          baseReward: baseReward,
          streakBonus: streakBonus,
          totalReward: totalReward
        }, { merge: true });
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error tracking user login:', error);
    throw error;
  }
};

export const getLoginStreakData = async (userId) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User does not exist');
    }

    return userDoc.data().loginStreak;
  } catch (error) {
    console.error('Error getting login streak data:', error);
    throw error;
  }
};

export const getLoginRewards = async (userId) => {
  try {
    const loginRewardsRef = collection(firestore, 'users', userId, 'login_rewards');
    const querySnapshot = await getDocs(loginRewardsRef);

    const rewards = [];
    querySnapshot.forEach((doc) => {
      rewards.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return rewards;
  } catch (error) {
    console.error('Error getting login rewards:', error);
    throw error;
  }
};
