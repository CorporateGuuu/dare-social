import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
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

// Cloud Functions - with mock support
export const createDare = USE_MOCK
  ? mockCreateDare
  : async (dareData) => {
      return await httpsCallable(functions, "createDare")(dareData);
    };

export { createDare as default };
