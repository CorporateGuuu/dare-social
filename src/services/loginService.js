import { doc, updateDoc, collection, addDoc, getDoc, runTransaction, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const trackUserLogin = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const now = new Date();

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw new Error('User does not exist');
      }

      const userData = userDoc.data();
      const { loginStreak, stonesBalance } = userData;
      const { currentStreak, lastLogin, totalLogins, maxStreak } = loginStreak;

      // Calculate days since last login
      const lastLoginDate = new Date(lastLogin.seconds * 1000 || lastLogin.toDate());
      const daysSinceLastLogin = Math.floor((now - lastLoginDate) / (1000 * 60 * 60 * 24));

      let newCurrentStreak = currentStreak;
      let newMaxStreak = maxStreak;

      // Update streak logic
      if (daysSinceLastLogin === 1) {
        newCurrentStreak = currentStreak + 1;
        newMaxStreak = Math.max(newMaxStreak, newCurrentStreak);
      } else if (daysSinceLastLogin > 1) {
        newCurrentStreak = 1;
      } else if (daysSinceLastLogin === 0) {
        // Same day login, no changes
        return;
      }

      // Calculate base reward (5 stones for login)
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
        totalLogins: totalLogins + 1,
        maxStreak: newMaxStreak
      };

      const updates = {
        loginStreak: updatedLoginStreak,
        stonesBalance: stonesBalance + (canClaimReward ? totalReward : 0),
        loginEarnings: (userData.loginEarnings || 0) + (canClaimReward ? totalReward : 0),
        ...(canClaimReward && { dailyRewardLastClaimed: now })
      };

      transaction.update(userRef, updates);

      // Add login reward document to subcollection if reward claimed
      if (canClaimReward) {
        const loginRewardsRef = collection(userRef, 'login_rewards');
        await addDoc(loginRewardsRef, {
          loginDate: now,
          stonesEarned: baseReward,
          streakBonus: streakBonus,
          totalReward: totalReward
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error tracking user login:', error);
    throw new Error(error.message);
  }
};

export const getLoginStreakData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
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
    const loginRewardsRef = collection(db, 'users', userId, 'login_rewards');
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
