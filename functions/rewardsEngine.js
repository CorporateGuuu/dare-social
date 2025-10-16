const functions = require('firebase-functions');
const admin = require('firebase-admin');
// Note: admin.initializeApp() should only be called once in index.js
// So we omit it here to prevent duplicate initialization

const db = admin.firestore();

// Configuration for reward amounts
const REWARD_CONFIG = {
  creation: {
    base: 10,
    types: {
      text: 10,
      image: 12,
      video: 15,
      challenge_update: 8,
      dare_proof: 10,
      story: 5
    }
  },
  engagement: {
    like: 2,
    comment: 3,
    share: 5
  },
  milestone: {
    10: 5,  // 10 views
    25: 10, // 25 views
    50: 15, // 50 views
    100: 20 // 100 views
  }
};

// Record a reward (called from various events)
exports.recordReward = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const {
    postId,
    rewardType, // "creation", "engagement", "milestone"
    trigger, // "post_create", "like", "comment", etc.
    amount,
    timestamp
  } = data;

  const userId = context.auth.uid;

  if (!postId || !rewardType || !trigger || !amount || !timestamp) {
    throw new functions.https.HttpsError('invalid-argument', 'All reward fields are required.');
  }

  try {
    const now = admin.firestore.FieldValue.serverTimestamp();

    // Fetch current post engagement metrics
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Post not found.');
    }

    const postData = postDoc.data();
    const engagementMetrics = {
      likes: postData.engagement?.likes || 0,
      comments: postData.engagement?.comments || 0,
      shares: postData.engagement?.shares || 0,
    };

    // Create the reward document
    const rewardRef = db.collection('rewards').doc();
    const rewardData = {
      postId,
      rewardType,
      amount,
      trigger,
      timestamp,
      engagementMetrics,
      userId,
      claimed: false,
      createdAt: now,
    };

    await rewardRef.set(rewardData);

    // Update user's pending rewards
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      pendingRewards: admin.firestore.FieldValue.increment(amount)
    });

    // Log transaction
    await userRef.collection('transactions').add({
      type: `reward_${rewardType}`,
      amount,
      description: `Reward for ${trigger}`,
      timestamp: now,
      data: { postId, trigger }
    });

    return {
      success: true,
      rewardId: rewardRef.id,
      message: 'Reward recorded successfully.'
    };

  } catch (error) {
    console.error('Error recording reward:', error);
    throw new functions.https.HttpsError('internal', 'Failed to record reward.');
  }
});

// Get user rewards
exports.getUserRewards = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { userId, filters = {}, limit = 50 } = data;
  const requestUserId = context.auth.uid;

  // Users can only fetch their own rewards
  if (userId !== requestUserId) {
    throw new functions.https.HttpsError('permission-denied', 'You can only fetch your own rewards.');
  }

  try {
    let query = db.collection('rewards')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    // Apply filters
    if (filters.rewardType) {
      query = query.where('rewardType', '==', filters.rewardType);
    }

    if (filters.claimed !== undefined) {
      query = query.where('claimed', '==', filters.claimed);
    }

    if (filters.postId) {
      query = query.where('postId', '==', filters.postId);
    }

    const snapshot = await query.get();
    const rewards = [];

    for (const doc of snapshot.docs) {
      const rewardData = doc.data();
      rewards.push({
        rewardId: doc.id,
        ...rewardData
      });
    }

    return {
      success: true,
      rewards,
      message: 'Rewards fetched successfully.'
    };

  } catch (error) {
    console.error('Error fetching rewards:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch rewards.');
  }
});

// Claim a reward
exports.claimReward = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { rewardId } = data;
  const userId = context.auth.uid;

  if (!rewardId) {
    throw new functions.https.HttpsError('invalid-argument', 'Reward ID is required.');
  }

  try {
    const rewardRef = db.collection('rewards').doc(rewardId);
    const rewardDoc = await rewardRef.get();

    if (!rewardDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Reward not found.');
    }

    const rewardData = rewardDoc.data();

    // Verify ownership
    if (rewardData.userId !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'You can only claim your own rewards.');
    }

    // Check if already claimed
    if (rewardData.claimed) {
      throw new functions.https.HttpsError('failed-precondition', 'Reward has already been claimed.');
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    // Claim the reward in a transaction
    return db.runTransaction(async (transaction) => {
      // Update reward as claimed
      transaction.update(rewardRef, {
        claimed: true,
        claimedAt: now,
      });

      // Update user's balances
      const userRef = db.collection('users').doc(userId);
      transaction.update(userRef, {
        stonesBalance: admin.firestore.FieldValue.increment(rewardData.amount),
        pendingRewards: admin.firestore.FieldValue.increment(-rewardData.amount),
      });

      // Add to transaction history
      transaction.add(userRef.collection('transactions'), {
        type: 'reward_claim',
        amount: rewardData.amount,
        description: `Claimed ${rewardData.rewardType} reward for ${rewardData.trigger}`,
        timestamp: now,
      });

      return {
        success: true,
        claimed: true,
        amount: rewardData.amount,
        message: 'Reward claimed successfully.'
      };
    });

  } catch (error) {
    console.error('Error claiming reward:', error);
    throw new functions.https.HttpsError('internal', 'Failed to claim reward.');
  }
});

// Process engagement rewards
exports.processEngagementRewards = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  const { postId, engagementType } = data;
  const userId = context.auth.uid;

  if (!postId || !engagementType) {
    throw new functions.https.HttpsError('invalid-argument', 'Post ID and engagement type are required.');
  }

  // Validate engagement type
  const validTypes = ['like', 'comment', 'share'];
  if (!validTypes.includes(engagementType)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid engagement type.');
  }

  try {
    const postRef = db.collection('posts').doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Post not found.');
    }

    const postData = postDoc.data();

    // Check if user is not the post author (don't reward self-engagement)
    if (postData.authorId === userId) {
      return {
        success: true,
        rewards: [],
        message: 'No rewards for self-engagement.'
      };
    }

    const now = admin.firestore.Timestamp.now();

    // Calculate reward amount
    const amount = REWARD_CONFIG.engagement[engagementType];

    // Record the reward
    const rewardRef = db.collection('rewards').doc();
    const rewardData = {
      postId,
      rewardType: 'engagement',
      amount,
      trigger: engagementType,
      timestamp: now,
      engagementMetrics: {
        likes: postData.engagement?.likes || 0,
        comments: postData.engagement?.comments || 0,
        shares: postData.engagement?.shares || 0,
      },
      userId,
      claimed: false,
      createdAt: now,
    };

    await rewardRef.set(rewardData);

    // Update author's user data
    const authorRef = db.collection('users').doc(postData.authorId);
    await authorRef.update({
      pendingRewards: admin.firestore.FieldValue.increment(amount)
    });

    // Log transaction for author
    await authorRef.collection('transactions').add({
      type: 'reward_engagement',
      amount,
      description: `Engagement reward for ${engagementType}`,
      timestamp: now,
      data: { postId, trigger: engagementType, engagerId: userId }
    });

    return {
      success: true,
      rewards: [{
        rewardId: rewardRef.id,
        ...rewardData
      }],
      message: 'Engagement rewards processed successfully.'
    };

  } catch (error) {
    console.error('Error processing engagement rewards:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process engagement rewards.');
  }
});

// Cloud Function trigger for post creation rewards
exports.processPostCreationRewards = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snapshot, context) => {
    const postId = context.params.postId;
    const postData = snapshot.data();

    try {
      const now = admin.firestore.Timestamp.now();

      // Determine reward amount based on post type
      const baseAmount = REWARD_CONFIG.creation.types[postData.type] || REWARD_CONFIG.creation.base;

      // Record creation reward
      const rewardRef = db.collection('rewards').doc();
      const rewardData = {
        postId,
        rewardType: 'creation',
        amount: baseAmount,
        trigger: 'post_create',
        timestamp: now,
        engagementMetrics: {
          likes: 0,
          comments: 0,
          shares: 0,
        },
        userId: postData.authorId,
        claimed: false,
        createdAt: now,
      };

      await rewardRef.set(rewardData);

      // Update user's pending rewards
      const userRef = db.collection('users').doc(postData.authorId);
      await userRef.update({
        pendingRewards: admin.firestore.FieldValue.increment(baseAmount),
        stonesBalance: admin.firestore.FieldValue.increment(baseAmount) // Auto-claim creation rewards
      });

      // Log transaction
      await userRef.collection('transactions').add({
        type: 'reward_creation',
        amount: baseAmount,
        description: `Creation reward for new ${postData.type}`,
        timestamp: now,
      });

      console.log(`Processed creation reward for post ${postId}: ${baseAmount} Stones`);

    } catch (error) {
      console.error('Error processing post creation rewards:', error);
    }
  });

// Cloud Function trigger for milestone rewards (views)
exports.processMilestoneRewards = functions.firestore
  .document('posts/{postId}')
  .onUpdate(async (change, context) => {
    const postId = context.params.postId;
    const newData = change.after.data();
    const previousData = change.before.data();

    const newViews = newData.engagement?.views || 0;
    const previousViews = previousData.engagement?.views || 0;

    // Check if a milestone has been hit
    const milestoneThresholds = Object.keys(REWARD_CONFIG.milestone).map(Number).sort((a, b) => a - b);

    for (const threshold of milestoneThresholds) {
      if (previousViews < threshold && newViews >= threshold) {
        try {
          const now = admin.firestore.Timestamp.now();
          const amount = REWARD_CONFIG.milestone[threshold];

          // Record milestone reward
          const rewardRef = db.collection('rewards').doc();
          const rewardData = {
            postId,
            rewardType: 'milestone',
            amount,
            trigger: `${threshold}_views`,
            timestamp: now,
            engagementMetrics: {
              likes: newData.engagement?.likes || 0,
              comments: newData.engagement?.comments || 0,
              shares: newData.engagement?.shares || 0,
            },
            userId: newData.authorId,
            claimed: false,
            createdAt: now,
          };

          await rewardRef.set(rewardData);

          // Update user's pending rewards
          const userRef = db.collection('users').doc(newData.authorId);
          await userRef.update({
            pendingRewards: admin.firestore.FieldValue.increment(amount)
          });

          // Log transaction
          await userRef.collection('transactions').add({
            type: 'reward_milestone',
            amount,
            description: `Milestone reward for ${threshold} views`,
            timestamp: now,
          });

          console.log(`Processed milestone reward for post ${postId}: ${threshold} views, ${amount} Stones`);

        } catch (error) {
          console.error('Error processing milestone rewards:', error);
        }
        break; // Only reward the first milestone reached in this update
      }
    }
  });
