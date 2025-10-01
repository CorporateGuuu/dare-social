// Voting utilities for challenges (dares)
import axios from 'axios';
import * as Notifications from 'expo-notifications';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { auth, db, ensureSignedIn, updateStoneBalance } from '../lib/firebase.js';

// Send push notification via Expo Push Service
const sendPushNotification = async (tokens, title, body, category, data) => {
  const message = {
    to: tokens,
    sound: 'default',
    title,
    body,
    data,
    categoryId: category, // Custom field for Expo
  };

  await axios.post('https://exp.host/--/api/v2/push/send', message, {
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
  });
};

// Submit proof for a dare (replace mock with real Firestore write)
export async function submitProof(dareId, proofData) {
  await ensureSignedIn();
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  try {
    const proofRef = collection(db, 'dares', dareId, 'proofs');
    await addDoc(proofRef, {
      userId,
      proofData,
      submittedAt: serverTimestamp(),
      status: 'pending' // Pending vote
    });
    console.log('Proof submitted for dare:', dareId);
  } catch (error) {
    console.error('Error submitting proof:', error);
    throw error;
  }
}

// Cast a vote for a dare's proof (replace mock with real Firestore write)
export async function castVote(dareId, voterId, vote) {
  await ensureSignedIn();
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');
  if (voterId !== userId) throw new Error('Cannot vote for others');

  try {
    const voteRef = collection(db, 'dares', dareId, 'votes');
    // Prevent duplicate votes
    const existingQuery = query(voteRef, where('voterId', '==', userId));
    const existing = await getDocs(existingQuery);
    if (!existing.empty) {
      throw new Error('Already voted');
    }

    await addDoc(voteRef, {
      voterId: userId,
      vote, // true/false for success/fail
      votedAt: serverTimestamp()
    });
    console.log('Vote cast for dare:', dareId);
  } catch (error) {
    console.error('Error casting vote:', error);
    throw error;
  }
}

// Tally votes for a dare (replace mock with real Firestore query)
export async function tallyVotes(dareId) {
  try {
    const votesRef = collection(db, 'dares', dareId, 'votes');
    const votesSnap = await getDocs(votesRef);
    const votes = votesSnap.docs.map(doc => doc.data());

    const totalVotes = votes.length;
    const yesVotes = votes.filter(v => v.vote === true).length;
    const noVotes = votes.filter(v => v.vote === false).length;

    // Determine if majority for success
    const isSuccess = yesVotes > noVotes;
    let winner = null;

    // Update dare status if success, set winner to proof submitter (assume one proof)
    const dareRef = doc(db, 'dares', dareId);
    const dareSnap = await getDoc(dareRef);
    if (dareSnap.exists()) {
      const dare = dareSnap.data();
      if (isSuccess) {
        // Set status completed, and winner to the proof submitter
        const proofsRef = collection(db, 'dares', dareId, 'proofs');
        const proofsSnap = await getDocs(proofsRef);
        if (!proofsSnap.empty) {
          winner = proofsSnap.docs[0].data().userId; // Assume first submitter
          await updateDoc(dareRef, {
            status: 'completed',
            winner,
            tally: { totalVotes, yesVotes, noVotes, isSuccess },
            completedAt: serverTimestamp()
          });
        }
      } else {
        await updateDoc(dareRef, {
          status: 'failed',
          tally: { totalVotes, yesVotes, noVotes, isSuccess }
        });
      }
    }

    // Send push notification to participants (in production, get tokens from Firestore)
    const tokens = ['mock-expo-push-token']; // Replace with real tokens from users/{userId}/pushToken
    await sendPushNotification(tokens, 'Challenge Resolved!', `The winner of "${dareId}" is ${winner?.username || 'proof winner'}`, 'CHALLENGE_RESULT', { dareId, isSuccess, winner });

    // Also send local notification for immediate feedback
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Challenge Resolved!',
        body: `The winner of "${dareId}" is ${winner?.username || 'proof winner'}`,
        data: { dareId, isSuccess, winner },
        categoryIdentifier: 'CHALLENGE_RESULT',
        sound: true,
      },
      trigger: null, // Immediate
    });

    return { totalVotes, yesVotes, noVotes, isSuccess };
  } catch (error) {
    console.error('Error tallying votes:', error);
    throw error;
  }
}

// Notify voting start
export async function notifyVotingStart(dareId, tokens) {
  await sendPushNotification(tokens, 'Voting Started!', `Cast your vote for "${dareId}" now.`, 'VOTING_ALERT', { dareId });

  // Also send local notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Voting Started!',
      body: `Cast your vote for "${dareId}" now.`,
      data: { dareId },
      categoryIdentifier: 'VOTING_ALERT',
      sound: true,
    },
    trigger: null, // Immediate
  });
}

// Start voting phase after proofs submitted
export async function startVotingPhase(dareId) {
  const tokens = ['mock-expo-push-token']; // Replace with real tokens from Firestore
  await notifyVotingStart(dareId, tokens);
  console.log('Voting phase started for dare:', dareId);
}

// Distribute stakes based on votes (replace mock with real updateStoneBalance calls)
export async function distributeStakes(dareId) {
  try {
    const dareRef = doc(db, 'dares', dareId);
    const dareSnap = await getDoc(dareRef);
    if (!dareSnap.exists()) throw new Error('Dare not found');

    const dare = dareSnap.data();
    if (dare.status !== 'completed' || !dare.winner) return; // Only distribute if completed and has winner

    // Assume dare has 'participants': array of uids who accepted and staked, 'stake': number per participant
    const participants = dare.participants || [];
    const stake = dare.stake || 0;

    if (participants.length === 0 || stake === 0) return;

    // Deduct stake from each participant
    for (const participantId of participants) {
      try {
        await updateStoneBalance({
          userId: participantId,
          amount: -stake,
          type: 'stake-deduct',
          description: `Stake deducted for dare ${dareId}`
        });
      } catch (e) {
        console.error(`Error deducting stake from ${participantId}:`, e);
      }
    }

    // Distribute total stakes to winner
    const totalStakes = participants.length * stake;
    try {
      await updateStoneBalance({
        userId: dare.winner,
        amount: totalStakes,
        type: 'stake-win',
        description: `Won stakes for dare ${dareId}`
      });
    } catch (e) {
      console.error(`Error adding stakes to winner ${dare.winner}:`, e);
    }

    console.log('Stakes distributed for dare:', dareId);
  } catch (error) {
    console.error('Error distributing stakes:', error);
    throw error;
  }
}
