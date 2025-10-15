const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

exports.generateReferralCode = functions.https.onCall(async (data, context) => {
  if (!context.auth) return { error: 'Unauthorized' };

  const db = admin.firestore();
  const userId = context.auth.uid;

  // Check if user already has a code
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  if (userDoc.exists && userDoc.data()?.referrals?.code) {
    return { error: 'Referral code already exists' };
  }

  // Generate unique code with max attempts to prevent infinite loop
  let code;
  let attempts = 0;
  const maxAttempts = 10;
  do {
    code = crypto.randomBytes(3).toString('hex').toUpperCase();
    attempts++;
    if (attempts >= maxAttempts) {
      return { error: 'Failed to generate unique referral code' };
    }
  } while (await db.collection('referral_codes').doc(code).get().exists);

  // Create referral code
  await db.collection('referral_codes').doc(code).set({
    code,
    ownerId: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    usageCount: 0,
    maxUses: 10,
    status: 'active'
  });

  // Update user
  await userRef.update({
    'referrals.code': code,
    'referrals.createdAt': admin.firestore.FieldValue.serverTimestamp(),
    'referrals.sent': admin.firestore.FieldValue.increment(1)
  });

  return { code, message: 'Referral code generated successfully!' };
});

exports.redeemReferralCode = functions.https.onCall(async (data, context) => {
  if (!context.auth) return { error: 'Unauthorized' };

  const { code } = data;
  if (!code) return { error: 'Referral code required' };

  const db = admin.firestore();
  const userId = context.auth.uid;

  // Check if referral code exists and is valid
  const codeDoc = await db.collection('referral_codes').doc(code).get();
  if (!codeDoc.exists || codeDoc.data().status !== 'active' || codeDoc.data().usageCount >= codeDoc.data().maxUses) {
    return { error: 'Invalid or expired referral code' };
  }

  // Check if user already used this code or is the owner
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    return { error: 'User not found' };
  }

  const userData = userDoc.data();
  if ((userData.referralsUsed && userData.referralsUsed.includes(code)) || codeDoc.data().ownerId === userId) {
    return { error: 'Referral code cannot be redeemed' };
  }

  try {
    // Increment usage
    await db.collection('referral_codes').doc(code).update({
      usageCount: admin.firestore.FieldValue.increment(1)
    });

    // Update redeemer user
    const updates = {
      referralsUsed: admin.firestore.FieldValue.arrayUnion(code)
    };
    // Add rewards if applicable, e.g., points: admin.firestore.FieldValue.increment(10)
    await db.collection('users').doc(userId).update(updates);

    // Update referrer user
    const referrerId = codeDoc.data().ownerId;
    await db.collection('users').doc(referrerId).update({
      'referrals.redeemed': admin.firestore.FieldValue.increment(1)
      // Add rewards to referrer if applicable
    });

    return { message: 'Referral code redeemed successfully!' };
  } catch (error) {
    console.error('Error redeeming referral code:', error);
    return { error: 'Failed to redeem referral code' };
  }
});

exports.processReferral = functions.https.onCall(async (data, context) => {
  if (!context.auth) return { error: 'Unauthorized' };

  const { referralCode, eventType } = data;
  if (!referralCode || !eventType) return { error: 'Referral code and event type required' };

  const db = admin.firestore();
  const userId = context.auth.uid;

  if (eventType === 'signup') {
    try {
      // Check if referral code exists and is valid
      const codeDoc = await db.collection('referral_codes').doc(referralCode).get();
      if (!codeDoc.exists || codeDoc.data().status !== 'active' || codeDoc.data().usageCount >= codeDoc.data().maxUses) {
        return { error: 'Invalid or expired referral code' };
      }

      // Check if user already used this code or is the owner
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return { error: 'User not found' };
      }

      const userData = userDoc.data();
      if ((userData.referralsUsed && userData.referralsUsed.includes(referralCode)) || codeDoc.data().ownerId === userId) {
        return { error: 'Referral code cannot be redeemed' };
      }

      // Increment usage
      await db.collection('referral_codes').doc(referralCode).update({
        usageCount: admin.firestore.FieldValue.increment(1),
        usedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update new user (redeemer)
      const newUserUpdates = {
        referralsUsed: admin.firestore.FieldValue.arrayUnion(referralCode),
        referredBy: referralCode
      };
      await db.collection('users').doc(userId).update(newUserUpdates);

      // Update referrer user
      const referrerId = codeDoc.data().ownerId;
      await db.collection('users').doc(referrerId).update({
        'referrals.redeemed': admin.firestore.FieldValue.increment(1),
        referralEarnings: admin.firestore.FieldValue.increment(50) // Add 50 stones as reward
      });

      return { message: 'Referral processed successfully!' };
    } catch (error) {
      console.error('Error processing referral:', error);
      return { error: 'Failed to process referral' };
    }
  }

  return { error: 'Invalid event type' };
});

// Helper function to update referral achievement progress
async function updateReferralAchievement(referrerId, eventType) {
  const db = admin.firestore();

  // Get referrer's current achievement progress
  const userRef = db.collection('users').doc(referrerId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    console.error('Referrer user not found:', referrerId);
    return;
  }

  const userData = userDoc.data();
  const achievements = userData.achievements || {};

  // Initialize referral achievement if not present
  if (!achievements.referralAchievements) {
    achievements.referralAchievements = {};
  }

  // Update achievement based on event type
  const referralAchievements = achievements.referralAchievements;
  const progress = referralAchievements[eventType] || 0;

  // Increment progress for this event type
  referralAchievements[eventType] = progress + 1;

  // Check for achievement unlocks (example thresholds)
  const thresholds = {
    'signup': [1, 5, 10, 25, 50], // First referral, achieve referrals, etc.
    'purchase': [1, 10, 50], // First purchase referral, etc.
    'challenge_completed': [1, 5, 20] // First challenge completion referral, etc.
  };

  if (thresholds[eventType]) {
    const currentProgress = referralAchievements[eventType];
    const nextThreshold = thresholds[eventType].find(threshold => currentProgress === threshold);
    if (nextThreshold) {
      // Create achievement unlock event
      await db.collection('users').doc(referrerId).collection('achievement_events').add({
        achievementType: `referral_${eventType}_${nextThreshold}`,
        unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
        progress: currentProgress,
        threshold: nextThreshold
      });
    }
  }

  // Update user achievements
  await userRef.update({
    achievements: achievements
  });
}

exports.trackReferralConversion = functions.firestore
  .document('users/{userId}/referral_events/{eventId}')
  .onCreate(async (snap, context) => {
    const eventData = snap.data();
    if (eventData.status === 'completed') {
      // Track in Analytics
      admin.analytics().logEvent('referral_conversion', {
        event_type: eventData.eventType,
        reward_amount: eventData.rewardAmount,
        referrer_id: eventData.referrerId,
        referred_user_id: eventData.referredUserId
      });

      // Update referrer's achievement progress
      await updateReferralAchievement(eventData.referrerId, eventData.eventType);
    }
  });
