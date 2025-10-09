import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
import { USE_MOCK } from "../hooks/useDares";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Mock responses for development
const mockListDares = async () => {
  await delay(300);
  return {
    data: [
      { id: "1", title: "Do 20 push-ups", reward: 20, desc: "Film 20 clean reps", creatorId: "mock-1" },
      { id: "2", title: "Sing in public", reward: 30, desc: "30s clip in a cafe", creatorId: "mock-2" },
      { id: "3", title: "Ice bucket challenge", reward: 25, desc: "Pour and smile!", creatorId: "mock-3" },
    ]
  };
};

const mockListCompletedDares = async () => {
  await delay(300);
  return {
    data: [
      {
        id: "completed-1",
        title: "Virtual Dance Party",
        rewardStone: 15,
        winner: { uid: "winner-1", username: "dance_master" },
        losers: [{ uid: "loser-1", username: "dance_beginner" }],
        winnerProof: {
          mediaUrl: "https://example.com/dance-proof.jpg",
          caption: "I danced my heart out! 🎉"
        }
      },
      {
        id: "completed-2",
        title: "50 Push-ups Challenge",
        rewardStone: 20,
        winner: { uid: "winner-2", username: "fit_guru" },
        losers: [],
        winnerProof: {
          mediaUrl: "https://example.com/pushup-proof.jpg",
          caption: "All 50 done! 💪"
        }
      }
    ]
  };
};

// Cloud Functions - with mock support
export const listDares = USE_MOCK ? mockListDares : httpsCallable(functions, "listDares");
export const listCompletedDares = USE_MOCK ? mockListCompletedDares : httpsCallable(functions, "listCompletedDares");
export const getUserById = httpsCallable(functions, "getUserById");
export const acceptDare = httpsCallable(functions, "acceptDare");
export const submitProof = httpsCallable(functions, "submitProof");
export const castVote = httpsCallable(functions, "castVote");
export const completeDare = httpsCallable(functions, "completeDare");
export const updateStoneBalance = httpsCallable(functions, "updateStoneBalance");
export const updateDailyStreak = httpsCallable(functions, "updateDailyStreak");
export const searchUsers = httpsCallable(functions, "searchUsers");
export const getFrequentChallengers = httpsCallable(functions, "getFrequentChallengers");
