const functions = require('firebase-functions');
const admin = require('firebase-admin');
// Note: admin.initializeApp() should only be called once in index.js
// So we omit it here to prevent duplicate initialization

exports.checkAndAwardDailyLogin = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const newData = change.after.data();
    const oldData = change.before.data();
    const db = admin.firestore();

    // Check if lastLogin has updated (indicating a new login)
    if (!newData.lastLogin || newData.lastLogin === oldData.lastLogin) return null;

    // Calculate time since last claim
    const now = admin.firestore.FieldValue.serverTimestamp();
    const lastClaim = newData.dailyRewardLastClaimed || admin.firestore.Timestamp.fromDate(new Date(0)); // Epoch if null
    const diffMs = now.toMillis() - lastClaim.toMillis();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return null; // Prevent multiple claims in a day

    return db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);
      const currentData = userDoc.data();

      let currentStreak = currentData.loginStreak?.currentStreak || 0;
      let maxStreak = currentData.loginStreak?.maxStreak || 0;
      const totalLogins = (currentData.loginStreak?.totalLogins || 0) + 1;

      // Check for streak break (more than 1 day gap)
      if (diffDays > 1) {
        currentStreak = 1;
      } else {
        currentStreak += 1;
      }

      maxStreak = Math.max(maxStreak, currentStreak);

      // Base reward + streak bonus (cap at 7 days)
      const baseReward = 5; // Daily base Stones
      const streakBonus = Math.min(currentStreak, 7) * 2; // Up to 14 bonus Stones
      const totalReward = baseReward + streakBonus;

      // Update user data
      transaction.update(userRef, {
        'loginStreak.currentStreak': currentStreak,
        'loginStreak.maxStreak': maxStreak,
        'loginStreak.totalLogins': totalLogins,
        'loginStreak.lastLogin': now,
        'dailyRewardLastClaimed': now,
        'stonesBalance': admin.firestore.FieldValue.increment(totalReward),
        'loginEarnings': admin.firestore.FieldValue.increment(totalReward),
      });

      // Log reward
      transaction.add(userRef.collection('login_rewards'), {
        loginDate: now,
        stonesEarned: baseReward,
        streakBonus: streakBonus,
        totalReward: totalReward,
      });

      // Log transaction
      transaction.add(userRef.collection('transactions'), {
        type: 'login_earn',
        amount: totalReward,
        description: `Daily login reward (Streak: ${currentStreak})`,
        timestamp: now,
      });

      return {
        success: true,
        message: `Earned ${totalReward} Stones! (Streak: ${currentStreak})`,
      };
    });
  });
