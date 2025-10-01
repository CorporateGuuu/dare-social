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
