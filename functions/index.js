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
    submittedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { success: true, message: "Proof submitted" };
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
