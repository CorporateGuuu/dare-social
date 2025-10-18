import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";

// Cloud Functions for dare pair operations
export const getDarePairs = async (userId) => {
  try {
    const getDarePairsFunction = httpsCallable(functions, "getDarePairs");
    const result = await getDarePairsFunction({ userId });

    return {
      data: {
        success: true,
        pairs: result.data.pairs || [],
        message: "Dare pairs retrieved successfully"
      }
    };
  } catch (error) {
    console.error("Error getting dare pairs:", error);
    return {
      data: {
        success: false,
        pairs: [],
        message: "Failed to retrieve dare pairs"
      }
    };
  }
};

export const getDarePair = async (userA, userB) => {
  try {
    // Sort IDs for consistent lookup
    const [sortedA, sortedB] = [userA, userB].sort();
    const pairId = `uid_${sortedA}_uid_${sortedB}`;

    const getDarePairFunction = httpsCallable(functions, "getDarePair");
    const result = await getDarePairFunction({ pairId });

    return {
      data: {
        success: true,
        pair: result.data.pair,
        message: "Dare pair retrieved successfully"
      }
    };
  } catch (error) {
    console.error("Error getting dare pair:", error);
    return {
      data: {
        success: false,
        pair: null,
        message: "Failed to retrieve dare pair"
      }
    };
  }
};

// Utility functions for working with pair data
export const getPairDisplayName = (pair, currentUserId) => {
  const otherUserId = pair.userA === currentUserId ? pair.userB : pair.userA;
  // In a real app, you'd fetch the user data to get their name
  return `vs ${otherUserId}`;
};

export const formatStreak = (streak) => {
  if (streak === 0) return "No streak";
  if (streak === 1) return "1 dare streak";
  return `${streak} dare streak`;
};

export const formatLastDareDate = (date, locale = "en-US") => {
  if (!date) return "Never";
  const dateObj = date.toDate ? date.toDate() : new Date(date);
  return dateObj.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};
