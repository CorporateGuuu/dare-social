const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const { generateReferralCode } = require('./referral');
require('./loginRewards');
require('./createPost');
require('./rewardsEngine');

exports.awardEngagementRewards = functions.firestore
  .document('posts/{postId}/engagement/{engagementId}')
  .onWrite(async (change, context) => {
    const postId = context.params.postId;
    const postRef = admin.firestore().collection('posts').doc(postId);
    const postDoc = await postRef.get();
    const postData = postDoc.data();

    if (!postData.stoneReward || postData.authorId === context.params.userId) {
      return null; // Don't reward author self-engagement
    }

    const engagement = change.after.data();
    const totalEngagement = {
      likes: postData.engagement?.likes || 0,
      comments: postData.engagement?.comments || 0,
      shares: postData.engagement?.shares || 0,
    };

    // Milestone rewards
    let bonusReward = 0;
    if (totalEngagement.likes >= 100) bonusReward += 5;
    if (totalEngagement.comments >= 25) bonusReward += 3;
    if (totalEngagement.shares >= 10) bonusReward += 7;

    if (bonusReward > 0) {
      const userRef = admin.firestore().collection('users').doc(postData.authorId);

      await admin.firestore().runTransaction(async (transaction) => {
        transaction.update(postRef, {
          'stoneReward.engagementBonus': admin.firestore.FieldValue.increment(bonusReward),
          'stoneReward.totalEarned': admin.firestore.FieldValue.increment(bonusReward),
          engagement: totalEngagement,
        });

        transaction.update(userRef, {
          'stonesBalance': admin.firestore.FieldValue.increment(bonusReward),
          'postStats.totalPostEarnings': admin.firestore.FieldValue.increment(bonusReward),
        });

        transaction.add(userRef.collection('post_rewards'), {
          postId,
          rewardType: 'engagement',
          amount: bonusReward,
          trigger: `${engagement.type}_milestone`,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          engagementMetrics: totalEngagement,
        });
      });
    }
  });

// Cloud Function for accepting a dare
exports.acceptDare = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { dareId } = data;
  const userId = context.auth.uid;

  try {
    const dareRef = admin.firestore().collection('dares').doc(dareId);
    const dareDoc = await dareRef.get();

    if (!dareDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Dare not found.');
    }

    const dareData = dareDoc.data();

    // Check if dare is already accepted or completed
    if (dareData.status !== 'open') {
      throw new functions.https.HttpsError('failed-precondition', 'Dare is not available for acceptance.');
    }

    // Update dare status and add accepter
    await dareRef.update({
      status: 'accepted',
      accepterId: userId,
      acceptedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true, message: 'Dare accepted successfully.' };
  } catch (error) {
    console.error('Error accepting dare:', error);
    throw new functions.https.HttpsError('internal', 'Failed to accept dare.');
  }
});

// Cloud Function for submitting proof of dare completion
exports.submitProof = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { dareId, proofText, proofImageUrl } = data;
  const userId = context.auth.uid;

  try {
    const dareRef = admin.firestore().collection('dares').doc(dareId);
    const dareDoc = await dareRef.get();

    if (!dareDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Dare not found.');
    }

    const dareData = dareDoc.data();

    // Check if user is the accepter
    if (dareData.accepterId !== userId) {
      throw new functions.https.HttpsError('failed-precondition', 'User is not the accepter of this dare.');
    }

    // Check if dare is accepted
    if (dareData.status !== 'accepted') {
      throw new functions.https.HttpsError('failed-precondition', 'Dare has not been accepted or is already completed.');
    }

    // Add proof to subcollection
    await dareRef.collection('proofs').add({
      uid: userId,
      text: proofText,
      imageUrl: proofImageUrl,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    });

    return { success: true, message: 'Proof submitted successfully.' };
  } catch (error) {
    console.error('Error submitting proof:', error);
    throw new functions.https.HttpsError('internal', 'Failed to submit proof.');
  }
});

// Cloud Function for completing a dare
exports.completeDare = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { dareId, proofId } = data;
  const userId = context.auth.uid;

  try {
    const dareRef = admin.firestore().collection('dares').doc(dareId);
    const dareDoc = await dareRef.get();

    if (!dareDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Dare not found.');
    }

    const dareData = dareDoc.data();

    // Only creator can complete the dare
    if (dareData.creatorId !== userId) {
      throw new functions.https.HttpsError('failed-precondition', 'Only the dare creator can complete it.');
    }

    // Check if dare is accepted
    if (dareData.status !== 'accepted') {
      throw new functions.https.HttpsError('failed-precondition', 'Dare has not been accepted.');
    }

    // Update proof status
    const proofRef = dareRef.collection('proofs').doc(proofId);
    await proofRef.update({
      status: 'approved',
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update dare status
    await dareRef.update({
      status: 'completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // TODO: Handle reward points, leaderboard updates, etc.

    return { success: true, message: 'Dare completed successfully.' };
  } catch (error) {
    console.error('Error completing dare:', error);
    throw new functions.https.HttpsError('internal', 'Failed to complete dare.');
  }
});

// Cloud Function for getting a bet by ID
exports.getBet = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { betId } = data;

  try {
    const betRef = admin.firestore().collection('bets').doc(betId);
    const betDoc = await betRef.get();

    if (!betDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Bet not found.');
    }

    const betData = betDoc.data();

    // Return the bet data matching the schema
    return {
      dareId: betData.dareId,
      participants: betData.participants || [],
      potTotal: betData.potTotal || 0,
      status: betData.status,
      createdAt: betData.createdAt
    };
  } catch (error) {
    console.error('Error getting bet:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get bet.');
  }
});

// Cloud Function for updating user balance
exports.updateBalance = functions.https.onCall(async (data, context) => {
  if (!context.auth) return { error: 'Unauthorized' };
  const { userId, amount, type, description } = data;
  const db = admin.firestore();
  return db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await transaction.get(userRef);
    const newBalance = userDoc.data().stonesBalance + amount;
    if (newBalance < 0) throw new Error('Insufficient balance');
    transaction.update(userRef, { stonesBalance: newBalance });
    transaction.add(userRef.collection('transactions'), { type, amount, description, timestamp: admin.firestore.FieldValue.serverTimestamp() });
    return { newBalance };
  });
});

// Cloud Function for generating referral code
exports.generateReferralCode = generateReferralCode;

// Cloud Function for using a referral code during user registration
exports.useReferralCode = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { referralCode, referrerId } = data; // referrerId can be passed if known, or we can derive from code
  const newUserId = context.auth.uid;
  const db = admin.firestore();

  try {
    // Find referral code
    let code = referralCode;
    let referrerIdToUse = referrerId;

    if (!code && !referrerIdToUse) {
      throw new functions.https.HttpsError('invalid-argument', 'Referral code or referrer ID required.');
    }

    if (!referrerIdToUse) {
      const codeDoc = await db.collection('referral_codes').doc(code).get();
      if (!codeDoc.exists || codeDoc.data().status !== 'active') {
        throw new functions.https.HttpsError('not-found', 'Invalid referral code.');
      }
      referrerIdToUse = codeDoc.data().ownerId;
    } else {
      // If referrer ID provided, find their code
      const userRef = db.collection('users').doc(referrerIdToUse);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Referrer not found.');
      }
      code = userDoc.data().referrals?.code;
      if (!code) {
        throw new functions.https.HttpsError('not-found', 'Referrer has no referral code.');
      }
    }

    // Prevent self-referral
    if (referrerIdToUse === newUserId) {
      throw new functions.https.HttpsError('invalid-argument', 'Cannot refer yourself.');
    }

    // Check max uses
    const codeRef = db.collection('referral_codes').doc(code);
    const codeDoc = await codeRef.get();
    const codeData = codeDoc.data();

    if (codeData.usageCount >= codeData.maxUses) {
      return { success: false, message: 'Referral code has reached maximum uses.' };
    }

    // Log referral event
    await db.collection('users').doc(referrerIdToUse).collection('referral_events').add({
      eventType: 'send',
      referrerId: referrerIdToUse,
      referredUserId: newUserId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      rewardAmount: 0, // Will be updated when rewards are earned
      status: 'pending'
    });

    await db.collection('users').doc(newUserId).collection('referral_events').add({
      eventType: 'receive',
      referrerId: referrerIdToUse,
      referredUserId: newUserId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      rewardAmount: 0,
      status: 'pending'
    });

    // Update referrer's sent count
    const referrerRef = db.collection('users').doc(referrerIdToUse);
    const referrerDoc = await referrerRef.get();
    const currentReferrals = referrerDoc.data().referrals;
    await referrerRef.update({
      'referrals.sent': currentReferrals.sent + 1
    });

    // Update code usage
    await codeRef.update({
      usageCount: admin.firestore.FieldValue.increment(1)
    });

    // Store referral relationship in new user profile
    await db.collection('users').doc(newUserId).update({
      referredBy: referrerIdToUse,
      referralCode: code,
      referralEarnings: 0
    });

    return { success: true, referrerId: referrerIdToUse };
  } catch (error) {
    console.error('Error using referral code:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process referral.');
  }
});

// Cloud Function for processing referral milestone rewards
exports.processReferralMilestone = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { userId, eventType } = data; // eventType: 'signup' | 'first_challenge' | 'first_dare'
  const callingUserId = context.auth.uid;
  const db = admin.firestore();

  try {
    // Verify caller permissions (caller should be authenticated user performing the action)
    if (callingUserId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Can only process milestones for yourself.');
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found.');
    }

    const userData = userDoc.data();
    const referrerId = userData.referredBy;

    if (!referrerId) {
      return { success: true, message: 'User was not referred.' };
    }

    // Define reward amounts based on milestone
    let rewardAmount = 0;
    if (eventType === 'signup') {
      rewardAmount = 5; // Reward for successful signup through referral
    } else if (eventType === 'first_challenge') {
      rewardAmount = 10; // Reward for completing first challenge
    } else if (eventType === 'first_dare') {
      rewardAmount = 10; // Reward for completing first dare
    } else {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid event type.');
    }

    // Check if this milestone has already been rewarded to prevent duplicates
    const existingEventQuery = await userRef.collection('referral_events').where('eventType', '==', eventType).limit(1).get();
    if (!existingEventQuery.empty) {
      const existingEvent = existingEventQuery.docs[0].data();
      if (existingEvent.status === 'completed' || existingEvent.rewardAmount > 0) {
        return { success: true, message: `Milestone ${eventType} already rewarded.` };
      }
    } else {
      // Create new event if it doesn't exist
      await userRef.collection('referral_events').add({
        eventType: eventType,
        referrerId: referrerId,
        referredUserId: userId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        rewardAmount: rewardAmount,
        status: 'pending'
      });
    }

    // Update referrer's successful referrals count and earnings
    const referrerRef = db.collection('users').doc(referrerId);
    const referrerDoc = await referrerRef.get();
    const currentReferrals = referrerDoc.data().referrals;
    const currentEarnings = referrerDoc.data().referralEarnings || 0;

    // Find and update the 'send' event for this user
    const sendEventQuery = await referrerRef.collection('referral_events')
      .where('eventType', '==', 'send')
      .where('referredUserId', '==', userId)
      .limit(1)
      .get();

    let eventIdToUpdate;
    if (!sendEventQuery.empty) {
      eventIdToUpdate = sendEventQuery.docs[0].id;
      await referrerRef.collection('referral_events').doc(eventIdToUpdate).update({
        status: 'completed',
        rewardAmount: rewardAmount
      });
    }

    // Update referrer's counts and earnings
    let newSuccessfulCount = currentReferrals.successful || 0;
    newSuccessfulCount = eventType === 'signup' ? newSuccessfulCount + 1 : newSuccessfulCount;

    await referrerRef.update({
      'referrals.successful': newSuccessfulCount,
      referralEarnings: currentEarnings + rewardAmount
    });

    // Add transaction for referrer's earnings
    await referrerRef.collection('transactions').add({
      type: 'referral_earning',
      amount: rewardAmount,
      description: `${eventType} milestone reward`,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update user stone balance
    await db.collection('users').doc(referrerId).update({
      stonesBalance: admin.firestore.FieldValue.increment(rewardAmount)
    });

    // Update the recipient's event as completed
    const recipientEventQuery = await userRef.collection('referral_events').where('eventType', '==', eventType).limit(1).get();
    if (!recipientEventQuery.empty) {
      await userRef.collection('referral_events').doc(recipientEventQuery.docs[0].id).update({
        status: 'completed',
        rewardAmount: rewardAmount
      });
    }

    return { success: true, rewardAmount, referrerId };
  } catch (error) {
    console.error('Error processing referral milestone:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process referral milestone.');
  }
});

// Cloud Function for resetting daily post limits
exports.resetDailyPostLimits = functions.pubsub
  .schedule('0 0 * * *') // Daily at midnight
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const db = admin.firestore();
    const batch = db.batch();
    const users = await db.collection('users').where('postStats.dailyPostCount', '>', 0).get();

    users.docs.forEach(doc => {
      batch.update(doc.ref, {
        'postStats.dailyPostCount': 0,
        'postStats.lastPostReset': admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return batch.commit();
  });
