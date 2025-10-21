import { httpsCallable } from "firebase/functions";
import { collection, query, where, getDocs } from "firebase/firestore";
import { functions, db } from "../config/firebase";
import { USE_MOCK } from "../hooks/useDares";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Mock response for development
const mockCreateDare = async (dareData) => {
  await delay(600);
  console.log("Mock createDare called with:", dareData);
  const dareId = `mock-dare-${Date.now()}`;
  const dare = {
    id: dareId,
    title: dareData.title,
    description: dareData.description,
    mediaUrl: dareData.mediaUri || "https://example.com/mock.jpg", // Assume upload later
    creatorId: dareData.creatorId,
    participants: [],
    status: "open",
    wagerType: dareData.wagerType || "none",
    wagerAmount: dareData.wagerAmount || 0,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  return {
    data: {
      success: true,
      dareId,
      dare,
      message: "Dare created successfully (mock)"
    }
  };
};

// Mock response for head-to-head dares
const mockGetHeadToHeadDares = async (uidA, uidB) => {
  await delay(400);

  // Mock data for head-to-head between two users
  const mockDares = [
    {
      dare_id: "mock-dare-1",
      title: "Basketball Prediction Challenge",
      challenger_id: uidA,
      opponent_id: uidB,
      winner_id: uidA,
      stake: 10,
      status: "completed",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      dare_id: "mock-dare-2",
      title: "Movie Box Office Bet",
      challenger_id: uidB,
      opponent_id: uidA,
      winner_id: uidB,
      stake: 15,
      status: "completed",
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    }
  ];

  return {
    data: {
      success: true,
      dares: mockDares,
      message: "Head-to-head dares retrieved successfully (mock)"
    }
  };
};

// Real implementation using Firestore query - matches the pattern from Profile.jsx
const getHeadToHeadDaresReal = async (uidA, uidB) => {
  try {
    // Use the same query pattern as provided in Profile.jsx
    const dareRef = collection(db, "dares");
    const q = query(
      dareRef,
      where("status", "==", "completed"),
      where("participants", "array-contains", [uidA, uidB])
    );

    const querySnapshot = await getDocs(q);
    const dares = [];

    querySnapshot.forEach((doc) => {
      dares.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      data: {
        success: true,
        dares: dares,
        message: "Head-to-head dares retrieved successfully"
      }
    };
  } catch (error) {
    console.error("Error getting head-to-head dares:", error);

    // Fallback: If the array-contains query fails, try alternative approach
    try {
      console.log("Trying fallback query approach...");
      const dareRef = collection(db, "dares");
      const q = query(
        dareRef,
        where("status", "==", "completed"),
        where("participants", "array-contains", uidA)
      );

      const querySnapshot = await getDocs(q);
      const dares = [];

      querySnapshot.forEach((doc) => {
        const dareData = doc.data();
        if (dareData.participants && dareData.participants.includes(uidB)) {
          dares.push({
            id: doc.id,
            ...dareData
          });
        }
      });

      return {
        data: {
          success: true,
          dares: dares,
          message: "Head-to-head dares retrieved successfully (fallback)"
        }
      };
    } catch (fallbackError) {
      console.error("Fallback query also failed:", fallbackError);
      return {
        data: {
          success: false,
          dares: [],
          message: "Failed to retrieve head-to-head dares"
        }
      };
    }
  }
};

// Cloud Functions - with mock support
export const createDare = USE_MOCK
  ? mockCreateDare
  : async (dareData) => {
      return await httpsCallable(functions, "createDare")(dareData);
    };

export const getHeadToHeadDares = USE_MOCK
  ? mockGetHeadToHeadDares
  : getHeadToHeadDaresReal;

export { createDare as default };
