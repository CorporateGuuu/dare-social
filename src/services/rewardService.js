import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
import { USE_MOCK } from "../hooks/useDares";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Mock response for recording rewards
const mockRecordReward = async (rewardData) => {
  await delay(300);
  console.log("Mock recordReward called with:", rewardData);

  // Mock reward document ID
  const rewardId = `mock-reward-${Date.now()}`;

  return {
    data: {
      success: true,
      rewardId,
      message: "Reward recorded successfully (mock)"
    }
  };
};

export const recordReward = USE_MOCK
  ? mockRecordReward
  : async (rewardData) => {
      return await httpsCallable(functions, "recordReward")(rewardData);
    };

// Mock response for getting user rewards
const mockGetUserRewards = async (userId, filters = {}) => {
  await delay(400);
  console.log("Mock getUserRewards called with:", { userId, filters });

  const mockRewards = [
    {
      rewardId: "reward-1",
      postId: "post-1",
      rewardType: "creation",
      amount: 10,
      trigger: "post_create",
      timestamp: new Date().toISOString(),
      engagementMetrics: {
        likes: 0,
        comments: 0,
        shares: 0,
      }
    },
    {
      rewardId: "reward-2",
      postId: "post-2",
      rewardType: "engagement",
      amount: 5,
      trigger: "like",
      timestamp: new Date().toISOString(),
      engagementMetrics: {
        likes: 1,
        comments: 0,
        shares: 0,
      }
    }
  ];

  return {
    data: {
      success: true,
      rewards: mockRewards,
      message: "Rewards fetched successfully (mock)"
    }
  };
};

export const getUserRewards = USE_MOCK
  ? mockGetUserRewards
  : async (userId, filters = {}) => {
      return await httpsCallable(functions, "getUserRewards")({ userId, filters });
    };

// Mock response for claiming rewards
const mockClaimReward = async (rewardId) => {
  await delay(200);
  console.log("Mock claimReward called with:", rewardId);

  return {
    data: {
      success: true,
      claimed: true,
      amount: 10,
      message: "Reward claimed successfully (mock)"
    }
  };
};

export const claimReward = USE_MOCK
  ? mockClaimReward
  : async (rewardId) => {
      return await httpsCallable(functions, "claimReward")(rewardId);
    };

// Mock response for processing engagement rewards
const mockProcessEngagementRewards = async (postId, engagementType, userId) => {
  await delay(400);
  console.log("Mock processEngagementRewards called with:", { postId, engagementType, userId });

  const mockRewards = [
    {
      rewardId: `mock-engagement-${Date.now()}`,
      postId,
      rewardType: "engagement",
      amount: engagementType === "like" ? 2 : engagementType === "comment" ? 3 : 1,
      trigger: engagementType,
      timestamp: new Date().toISOString(),
      engagementMetrics: {
        likes: engagementType === "like" ? 1 : 0,
        comments: engagementType === "comment" ? 1 : 0,
        shares: 0,
      }
    }
  ];

  return {
    data: {
      success: true,
      rewards: mockRewards,
      message: "Engagement rewards processed successfully (mock)"
    }
  };
};

export const processEngagementRewards = USE_MOCK
  ? mockProcessEngagementRewards
  : async (postId, engagementType, userId) => {
      return await httpsCallable(functions, "processEngagementRewards")({ postId, engagementType, userId });
    };

export default recordReward;
