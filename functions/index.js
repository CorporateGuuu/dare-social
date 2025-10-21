import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentWritten, onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import sgMail from "@sendgrid/mail";

admin.initializeApp();
const db = admin.firestore();

// Check daily for expired dares
export const expireDares = onSchedule("every 24 hours", async () => {
  const now = new Date();
  const snapshot = await db
    .collection("dares")
    .where("status", "==", "pending")
    .where("accept_by", "<=", now)
    .get();

  const batch = db.batch();

  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { status: "expired" });
  });

  await batch.commit();
  console.log(`⏰ Marked ${snapshot.size} dares as expired`);
});

// Clean up expired notifications
export const cleanExpiredNotifications = onSchedule("every 24 hours", async () => {
  const now = new Date();
  const snapshot = await db
    .collectionGroup("notifications")
    .where("expires_at", "<", now)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log(`🧹 Deleted ${snapshot.size} expired notifications`);
});

// Trigger function to automatically update leaderboard when dares are completed
export const updateLeaderboard = onDocumentWritten("dares/{dareId}", async (event) => {
  const after = event.data.after?.data();
  if (after?.status === "completed" && after?.winner_id) {
    const { winner_id, stake } = after;
    await db.collection("leaderboard").doc(winner_id).set(
      {
        wins: admin.firestore.FieldValue.increment(1),
        stones_earned: admin.firestore.FieldValue.increment(stake),
      },
      { merge: true }
    );
  }
});

// Trigger function for dare creation notifications
export const onDareCreate = onDocumentCreated("dares/{dareId}", async (event) => {
  const dare = event.data.data();

  const opponentId = dare.opponent_id;
  const challengerId = dare.challenger_id;
  const challengerSnap = await db.collection("users").doc(challengerId).get();
  const challenger = challengerSnap.exists ? challengerSnap.data() : {};

  // Build notification payload
  const message = {
    title: "🏆 New Dare Challenge!",
    body: `${challenger.username || "Someone"} has challenged you to: "${dare.title}"`,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    type: "dare_invite",
    dare_id: event.params.dareId,
    read: false,
    expires_at: dare.accept_by,
  };

  // Save notification
  await db.collection("users").doc(opponentId).collection("notifications").add(message);

  // Send push notification
  const userTokenSnap = await db.collection("users").doc(opponentId).get();
  const userToken = userTokenSnap.data()?.fcm_token;

  if (userToken) {
    await admin.messaging().send({
      token: userToken,
      notification: {
        title: message.title,
        body: message.body,
      },
      data: {
        dareId: event.params.dareId,
        type: "dare_invite",
      },
    });
    console.log(`📲 Push sent to ${opponentId}`);
  }

  // Send email notification
  const opponentEmail = userTokenSnap.data()?.email;
  if (opponentEmail) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send({
      to: opponentEmail,
      from: "no-reply@dareapp.io",
      subject: "🏆 New Dare Challenge",
      text: `${challenger.username || "Someone"} has challenged you to: "${dare.title}"\n\nAccept within 3 days!`,
    });
    console.log(`📧 Email sent to ${opponentEmail}`);
  }

  console.log(`📩 Notification sent to ${opponentId} for Dare ${event.params.dareId}`);
});

const functions = require('firebase-functions');
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

// Additional dare acceptance handler
export const onDareAccept = async (dareId, opponentId) => {
  const dareRef = db.collection("dares").doc(dareId);
  const dare = await dareRef.get();

  if (!dare.exists) throw new Error("Dare not found");

  // Validate 3-day limit
  const acceptDeadline = dare.data().accept_by.toDate();
  if (new Date() > acceptDeadline) throw new Error("Deadline expired");

  await dareRef.update({
    status: "active",
    accepted_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: "Dare accepted!" };
};

// Dare completion handler with leaderboard updates
export const completeDare = async (dareId, winnerId) => {
  const dareRef = db.collection("dares").doc(dareId);
  const dare = await dareRef.get();

  if (!dare.exists) throw new Error("Dare not found");

  const { challenger_id, opponent_id, stake } = dare.data();
  const loserId = winnerId === challenger_id ? opponent_id : challenger_id;

  // Update dare
  await dareRef.update({
    status: "completed",
    winner_id: winnerId,
  });

  // Update leaderboard stats
  const winnerRef = db.collection("leaderboard").doc(winnerId);
  const loserRef = db.collection("leaderboard").doc(loserId);

  await winnerRef.set(
    {
      wins: admin.firestore.FieldValue.increment(1),
      stones_earned: admin.firestore.FieldValue.increment(stake),
    },
    { merge: true }
  );

  await loserRef.set(
    { losses: admin.firestore.FieldValue.increment(1) },
    { merge: true }
  );

  console.log(`🏆 Dare ${dareId} completed. Winner: ${winnerId}`);
};

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

// Cloud Function for getting dare pairs for a user
exports.getDarePairs = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { userId } = data;
  const callingUserId = context.auth.uid;

  // Only allow users to get their own pairs (optional security)
  if (callingUserId !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'Can only retrieve your own dare pairs.');
  }

  try {
    const db = admin.firestore();
    const pairsRef = db.collection('dare_pairs');

    // Query for pairs where user is either userA or userB
    const [userAPairs, userBPairs] = await Promise.all([
      pairsRef.where('userA', '==', userId).get(),
      pairsRef.where('userB', '==', userId).get()
    ]);

    const pairs = [];

    userAPairs.forEach(doc => pairs.push(doc.data()));
    userBPairs.forEach(doc => pairs.push(doc.data()));

    return {
      success: true,
      pairs: pairs,
      message: 'Dare pairs retrieved successfully'
    };
  } catch (error) {
    console.error('Error getting dare pairs:', error);
    throw new functions.https.HttpsError('internal', 'Failed to retrieve dare pairs.');
  }
});

// Cloud Function for getting a specific dare pair
exports.getDarePair = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { pairId } = data;
  const callingUserId = context.auth.uid;

  try {
    const db = admin.firestore();
    const pairDoc = await db.collection('dare_pairs').doc(pairId).get();

    if (!pairDoc.exists) {
      return {
        success: false,
        pair: null,
        message: 'Dare pair not found'
      };
    }

    const pairData = pairDoc.data();

    // Check if the calling user is part of this pair
    if (![pairData.userA, pairData.userB].includes(callingUserId)) {
      throw new functions.https.HttpsError('permission-denied', 'Access denied to this dare pair.');
    }

    return {
      success: true,
      pair: pairData,
      message: 'Dare pair retrieved successfully'
    };
  } catch (error) {
    console.error('Error getting dare pair:', error);
    throw new functions.https.HttpsError('internal', 'Failed to retrieve dare pair.');
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

// Trigger function to automatically update player stats when dares are completed
export const updatePlayerStats = onDocumentWritten("dares/{dareId}", async (event) => {
  const after = event.data.after?.data();
  if (after?.status !== "completed") return;

  const { challenger_id, opponent_id, winner_id } = after;
  const loser_id = winner_id === challenger_id ? opponent_id : challenger_id;

  const winnerRef = db.collection("users").doc(winner_id);
  const loserRef = db.collection("users").doc(loser_id);

  // Update stats
  await winnerRef.set(
    {
      wins: admin.firestore.FieldValue.increment(1),
      mutuals: admin.firestore.FieldValue.arrayUnion(loser_id),
    },
    { merge: true }
  );

  await loserRef.set(
    {
      losses: admin.firestore.FieldValue.increment(1),
      mutuals: admin.firestore.FieldValue.arrayUnion(winner_id),
    },
    { merge: true }
  );

  console.log(`🔁 Updated win/loss stats for ${winner_id} and ${loser_id}`);
});

// Trigger function to automatically update friend stats when dares are completed
export const updateFriendStats = onDocumentWritten("dares/{dareId}", async (event) => {
  const after = event.data.after?.data();
  if (after?.status !== "completed") return;

  const { challenger_id, opponent_id } = after;
  const pairId = [challenger_id, opponent_id].sort().join("_");
  const ref = db.collection("friend_stats").doc(pairId);
  const docSnap = await ref.get();

  const today = new Date().toISOString().slice(0, 10);
  let currentStreak = 1;

  if (docSnap.exists) {
    const data = docSnap.data();
    const lastDate = data.last_dare_date.slice(0, 10);
    const diffDays = Math.floor(
      (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24)
    );
    currentStreak = diffDays <= 2 ? data.current_streak + 1 : 1;
  }

  await ref.set(
    {
      userA: challenger_id,
      userB: opponent_id,
      pair_ids: [challenger_id, opponent_id].sort(),
      total_dares: admin.firestore.FieldValue.increment(1),
      current_streak: currentStreak,
      last_dare_date: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log(`🔥 Updated streak between ${challenger_id} and ${opponent_id}`);
});

// Trigger function for follow notifications
export const onFollow = onDocumentCreated("users/{userId}/followers/{followerId}", async (event) => {
  const { userId, followerId } = event.params;
  if (userId === followerId) return; // Don't notify self-follows

  const followerSnap = await db.collection("users").doc(followerId).get();
  const follower = followerSnap.data();

  await db.collection("users").doc(userId).collection("notifications").add({
    title: "👥 New Follower",
    body: `${follower.username} started following you.`,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    type: "follow",
    followerId: followerId,
    read: false,
  });

  console.log(`📨 Follow notification sent to ${userId} from ${followerId}`);
});

// Cloud Function for managing following relationships
// GET /followers/{userId}/following/{targetId} - Check if user is following target
// POST /followers/{userId}/following/{targetId} - Follow target
// DELETE /followers/{userId}/following/{targetId} - Unfollow target
exports.manageFollowing = functions.https.onRequest(async (req, res) => {
  const cors = require('cors')({ origin: true });
  cors(req, res, async () => {
    // Extract userId and targetId from path
    const pathParts = req.path.split('/');
    if (pathParts.length < 4 || pathParts[1] !== 'followers' || pathParts[3] !== 'following') {
      return res.status(400).json({ error: 'Invalid path format. Expected /followers/{userId}/following/{targetId}' });
    }
    const userId = pathParts[2];
    const targetId = pathParts[4];

    // Authentication check
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No valid auth token provided' });
    }

    const idToken = req.headers.authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    try {
      const followingRef = admin.firestore().collection('users').doc(userId).collection('following').doc(targetId);

      if (req.method === 'GET') {
        // Check if following exists
        const doc = await followingRef.get();
        return res.json({ isFollowing: doc.exists() });

      } else if (req.method === 'POST') {
        // Only allow user to follow on their behalf
        if (authenticatedUserId !== userId) {
          return res.status(403).json({ error: 'Forbidden: Can only modify your own following relationships' });
        }

        // Check if already following
        const existingDoc = await followingRef.get();
        if (existingDoc.exists()) {
          return res.json({ success: true, message: 'Already following' });
        }

        // Create following relationship
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        await followingRef.set({
          followedAt: timestamp,
          id: targetId
        });

        // Add to target's followers
        await admin.firestore().collection('users').doc(targetId).collection('followers').doc(userId).set({
          followedAt: timestamp,
          id: userId
        });

        return res.json({ success: true, message: 'Successfully followed user' });

      } else if (req.method === 'DELETE') {
        // Only allow user to unfollow on their behalf
        if (authenticatedUserId !== userId) {
          return res.status(403).json({ error: 'Forbidden: Can only modify your own following relationships' });
        }

        // Remove following relationship
        await followingRef.delete();

        // Remove from target's followers
        await admin.firestore().collection('users').doc(targetId).collection('followers').doc(userId).delete();

        return res.json({ success: true, message: 'Successfully unfollowed user' });
      } else {
        return res.status(405).json({ error: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Error managing following:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Cloud Function for managing follower relationships
// GET /followers/{userId}/followers/{followerId} - Check if follower exists
// POST /followers/{userId}/followers/{followerId} - Only for internal use (users can't manually add followers)
// DELETE /followers/{userId}/followers/{followerId} - Only for internal use (users can't manually remove followers)
exports.manageFollowers = functions.https.onRequest(async (req, res) => {
  const cors = require('cors')({ origin: true });
  cors(req, res, async () => {
    // Extract userId and followerId from path
    const pathParts = req.path.split('/');
    if (pathParts.length < 4 || pathParts[1] !== 'followers' || pathParts[3] !== 'followers') {
      return res.status(400).json({ error: 'Invalid path format. Expected /followers/{userId}/followers/{followerId}' });
    }
    const userId = pathParts[2];
    const followerId = pathParts[4];

    // Authentication check
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No valid auth token provided' });
    }

    const idToken = req.headers.authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    try {
      const followerRef = admin.firestore().collection('users').doc(userId).collection('followers').doc(followerId);

      if (req.method === 'GET') {
        // Check if follower exists
        const doc = await followerRef.get();
        return res.json({ isFollower: doc.exists() });

      } else if (req.method === 'POST' || req.method === 'DELETE') {
        // For followers collection, operations are typically managed automatically
        // Only allow the follower themselves or service account to modify
        // This is primarily for internal use/synchronization
        if (authenticatedUserId !== followerId && decodedToken.role !== 'server') {
          return res.status(403).json({ error: 'Forbidden: Followers can only be modified automatically' });
        }

        if (req.method === 'POST') {
          // Create follower relationship (internal use)
          const timestamp = admin.firestore.FieldValue.serverTimestamp();
          await followerRef.set({
            followedAt: timestamp,
            id: followerId
          });
          return res.json({ success: true, message: 'Successfully added follower' });
        } else {
          // Remove follower relationship (internal use)
          await followerRef.delete();
          return res.json({ success: true, message: 'Successfully removed follower' });
        }
      } else {
        return res.status(405).json({ error: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Error managing followers:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});
