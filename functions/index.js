const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// 1. List Dares
exports.listDares = functions.https.onCall(async (data, context) => {
  const snap = await db.collection("dares").where("status", "==", "active").get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

// 2. Accept Dare
exports.acceptDare = functions.https.onCall(async ({ dareId }, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Login required");

  const participantRef = db.collection("dares").doc(dareId).collection("participants").doc(uid);
  const doc = await participantRef.get();
  if (doc.exists) return { success: true, message: "Already joined" };

  await participantRef.set({
    uid,
    joinedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { success: true, message: "Dare accepted" };
});

// 3. Submit Proof
exports.submitProof = functions.https.onCall(async ({ dareId, mediaUrl, caption }, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "Login required");

  const proofRef = db.collection("dares").doc(dareId).collection("proofs").doc();
  await proofRef.set({
    uid,
    mediaUrl,
    caption,
    submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    votes: 0
  });
  return { success: true, message: "Proof submitted" };
});

// Vote on a Proof
exports.castVote = functions.https.onCall(async ({ dareId, proofId }, context) => {
  const voterId = context.auth?.uid;
  if (!voterId) throw new functions.https.HttpsError("unauthenticated", "Login required");

  const voteRef = db.collection("dares").doc(dareId).collection("proofs").doc(proofId).collection("votes").doc(voterId);
  const proofRef = db.collection("dares").doc(dareId).collection("proofs").doc(proofId);

  const existing = await voteRef.get();
  if (existing.exists) {
    throw new functions.https.HttpsError("already-exists", "User already voted");
  }

  const batch = db.batch();
  batch.set(voteRef, {
    value: 1,
    votedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  batch.update(proofRef, {
    votes: admin.firestore.FieldValue.increment(1)
  });
  await batch.commit();

  return { success: true };
});

// 4. Update User Stats (stoneBalance and totalDaresCompleted)
exports.updateUserStats = functions.https.onCall(async ({ uid, stonesToAdd, daresCompleted }, context) => {
  const authUid = context.auth?.uid;
  if (!authUid) throw new functions.https.HttpsError("unauthenticated", "Login required");
  // Only allow updating own stats or from admin/server contexts

  const userRef = db.collection("users").doc(uid);
  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User not found");
    }
    const currentBalance = userDoc.data().stoneBalance || 0;
    const currentCompleted = userDoc.data().totalDaresCompleted || 0;

    transaction.update(userRef, {
      stoneBalance: currentBalance + stonesToAdd,
      totalDaresCompleted: currentCompleted + daresCompleted
    });
  });
  return { success: true };
});

// 5. Calculate and Update Leaderboard
exports.calculateLeaderboard = functions.https.onCall(async (data, context) => {
  // Get current week ID (e.g., 2025-W40)
  const now = new Date();
  const weekId = `${now.getFullYear()}-W${Math.ceil((now.getDate() - now.getDay() + 1) / 7)}`;

  // Get all users ordered by stoneBalance
  const usersSnap = await db.collection("users")
    .orderBy("stoneBalance", "desc")
    .orderBy("totalDaresCompleted", "desc")
    .limit(50) // Top 50 for full rankings
    .get();

  if (usersSnap.empty) return { success: true, message: "No users found" };

  const users = usersSnap.docs.map(doc => ({
    uid: doc.id,
    displayName: doc.data().displayName,
    stoneBalance: doc.data().stoneBalance || 0,
    totalDaresCompleted: doc.data().totalDaresCompleted || 0
  }));

  // Add ranks
  const rankings = users.map((user, index) => ({
    ...user,
    rank: index + 1
  }));

  const top10 = rankings.slice(0, 10);
  const firstPlace = rankings[0];
  const lastPlace = rankings[rankings.length - 1];

  const leaderboardRef = db.collection("leaderboard").doc(weekId);
  await leaderboardRef.set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    rankings,
    top10,
    firstPlace,
    lastPlace
  });

  return { success: true, weekId };
});

// 6. Update Stone Balance and Record Transaction
// 7. Complete Dare
exports.completeDare = functions.https.onCall(async ({ dareId, winnerId, rewardStone }, context) => {
  if (!dareId || !winnerId || !rewardStone) {
    throw new functions.https.HttpsError("invalid-argument", "dareId, winnerId, and rewardStone are required");
  }

  const dareRef = db.collection("dares").doc(dareId);
  const dareSnap = await dareRef.get();

  if (!dareSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Dare not found");
  }

  // Mark dare as completed
  await dareRef.update({
    status: "completed",
    winnerId,
    completedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Update winner balance and log transaction
  const userRef = db.collection("users").doc(winnerId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Winner not found");
  }

  const currentBalance = userSnap.data().stoneBalance || 0;
  const newBalance = currentBalance + rewardStone;

  const batch = db.batch();

  // Update balance
  batch.update(userRef, { stoneBalance: newBalance });

  // Add transaction log
  const txRef = userRef.collection("transactions").doc();
  batch.set(txRef, {
    type: "earn",
    amount: rewardStone,
    description: `Reward for completing dare ${dareId}`,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await batch.commit();

  return { success: true, winnerId, newBalance };
});

// 8. Update Stone Balance and Record Transaction
exports.updateStoneBalance = functions.https.onCall(async ({ userId, amount, type, description }, context) => {
  if (!userId || !amount || !type) {
    throw new functions.https.HttpsError("invalid-argument", "userId, amount, and type are required");
  }

  const userRef = db.collection("users").doc(userId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    throw new functions.https.HttpsError("not-found", "User not found");
  }

  const currentBalance = userSnap.data().stoneBalance || 0;
  let newBalance = currentBalance;

  if (type === "earn") {
    newBalance += amount;
  } else if (type === "spend") {
    if (currentBalance < amount) {
      throw new functions.https.HttpsError("failed-precondition", "Insufficient balance");
    }
    newBalance -= amount;
  } else {
    throw new functions.https.HttpsError("invalid-argument", "Invalid transaction type");
  }

  // Start a batch write
  const batch = db.batch();

  // Update balance
  batch.update(userRef, { stoneBalance: newBalance });

  // Add transaction record
  const txRef = userRef.collection("transactions").doc();
  batch.set(txRef, {
    type,
    amount,
    description: description || "",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await batch.commit();

  return {
    success: true,
    newBalance,
    transactionId: txRef.id,
  };
});

// Auto-Select Winner (runs every 24 hours)
exports.selectWinner = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    const openDares = await db.collection("dares").where("status", "==", "active").get();

    for (const dare of openDares.docs) {
      const dareId = dare.id;
      const proofsSnap = await db.collection("dares").doc(dareId).collection("proofs").orderBy("votes", "desc").get();

      if (proofsSnap.empty) continue;

      const topProof = proofsSnap.docs[0].data();
      const winnerId = topProof.uid;
      const rewardStone = dare.data().rewardStone || 0;

      // Award the winner
      const userRef = db.collection("users").doc(winnerId);
      const batch = db.batch();

      batch.update(userRef, {
        stoneBalance: admin.firestore.FieldValue.increment(rewardStone)
      });

      const txRef = userRef.collection("transactions").doc();
      batch.set(txRef, {
        type: "earn",
        amount: rewardStone,
        description: `Reward for winning dare ${dareId}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      batch.update(dare.ref, {
        status: "completed",
        winnerId,
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await batch.commit();
      console.log(`Dare ${dareId} completed. Winner: ${winnerId}`);
    }

    return true;
  });
