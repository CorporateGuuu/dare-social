import { castVote as firebaseCastVote } from '../lib/firebase';

export const submitProof = async (dareId, userId, proofData) => {
  try {
    console.log('Submit proof:', proofData);
    // TODO: implement proper submit proof logic
    return { success: true };
  } catch (error) {
    console.error('Error submitting proof:', error);
    throw error;
  }
};

export const tallyVotes = async (votes) => {
  try {
    console.log('Tally votes:', votes);
    // TODO: implement proper tally logic
    return { success: true };
  } catch (error) {
    console.error('Error tallying votes:', error);
    throw error;
  }
};

export const castVote = async (challengeId, proofId, userId, voteType) => {
  try {
    const result = await firebaseCastVote({
      challengeId,
      proofId,
      userId,
      vote: voteType
    });
    console.log('Cast vote result:', result);
    return result.data;
  } catch (error) {
    console.error('Error casting vote:', error);
    throw error;
  }
};
