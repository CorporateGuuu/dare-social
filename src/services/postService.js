import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
import { USE_MOCK } from "../hooks/useDares";
import { processEngagementRewards } from "./rewardService";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Mock response for development
const mockCreatePost = async (postData) => {
  await delay(600);
  console.log("Mock createPost called with:", postData);
  const postId = `mock-post-${Date.now()}`;
  const post = {
    id: postId,
    authorId: postData.authorId,
    type: postData.type,
    content: postData.content,
    mediaUrls: postData.mediaUrls || [],
    caption: postData.caption,
    tags: postData.tags || [],
    visibility: postData.visibility || "public",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    engagement: {
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
    },
    stoneReward: {
      baseReward: postData.baseReward || 10,
      engagementBonus: 0,
      totalEarned: postData.baseReward || 10,
      claimed: false,
    },
    moderation: {
      status: "approved",
      flaggedReason: "",
      approvedAt: new Date().toISOString(),
    }
  };
  return {
    data: {
      success: true,
      postId,
      post,
      message: "Post created successfully (mock)"
    }
  };
};

// Cloud Functions - with mock support
export const createPost = USE_MOCK
  ? mockCreatePost
  : async (postData) => {
      return await httpsCallable(functions, "createPost")(postData);
    };

// Mock response for getting posts
const mockGetPosts = async (filters = {}) => {
  await delay(400);
  console.log("Mock getPosts called with filters:", filters);

  const mockPosts = [
    {
      id: "mock-post-1",
      authorId: "user1",
      type: "text",
      content: "Just completed an amazing dare! Feeling great!",
      mediaUrls: [],
      caption: "",
      tags: ["dare", "fitness"],
      visibility: "public",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      engagement: { likes: 5, comments: 2, shares: 1, views: 100 },
      stoneReward: { baseReward: 10, engagementBonus: 5, totalEarned: 15, claimed: false },
      moderation: { status: "approved", flaggedReason: "", approvedAt: new Date().toISOString() }
    },
    {
      id: "mock-post-2",
      authorId: "user2",
      type: "image",
      content: "Check out this sunset after my morning run!",
      mediaUrls: ["https://example.com/sunset.jpg"],
      caption: "Beautiful view from the trail",
      tags: ["running", "nature"],
      visibility: "friends",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      engagement: { likes: 12, comments: 8, shares: 3, views: 245 },
      stoneReward: { baseReward: 15, engagementBonus: 10, totalEarned: 25, claimed: true },
      moderation: { status: "approved", flaggedReason: "", approvedAt: new Date().toISOString() }
    }
  ];

  return {
    data: {
      success: true,
      posts: mockPosts,
      message: "Posts fetched successfully (mock)"
    }
  };
};

export const getPosts = USE_MOCK
  ? mockGetPosts
  : async (filters = {}) => {
      return await httpsCallable(functions, "getPosts")(filters);
    };

// Mock response for liking a post
const mockLikePost = async ({ postId, userId }) => {
  await delay(200);
  console.log("Mock likePost called with:", { postId, userId });

  // Process engagement rewards for likes
  await processEngagementRewards(postId, "like", userId);

  return {
    data: {
      success: true,
      message: "Post liked successfully (mock)"
    }
  };
};

export const likePost = USE_MOCK
  ? mockLikePost
  : async (data) => {
      const result = await httpsCallable(functions, "likePost")(data);
      // Process engagement rewards for likes (non-mock mode)
      await processEngagementRewards(data.postId, "like", data.userId);
      return result;
    };

// Mock response for commenting on a post
const mockCommentOnPost = async ({ postId, userId, comment }) => {
  await delay(300);
  console.log("Mock commentOnPost called with:", { postId, userId, comment });

  // Process engagement rewards for comments
  await processEngagementRewards(postId, "comment", userId);

  return {
    data: {
      success: true,
      message: "Comment added successfully (mock)"
    }
  };
};

export const commentOnPost = USE_MOCK
  ? mockCommentOnPost
  : async (data) => {
      const result = await httpsCallable(functions, "commentOnPost")(data);
      // Process engagement rewards for comments (non-mock mode)
      await processEngagementRewards(data.postId, "comment", data.userId);
      return result;
    };

// Mock response for deleting a post
const mockDeletePost = async (postId) => {
  await delay(200);
  console.log("Mock deletePost called with:", postId);
  return {
    data: {
      success: true,
      message: "Post deleted successfully (mock)"
    }
  };
};

export const deletePost = USE_MOCK
  ? mockDeletePost
  : async (postId) => {
      return await httpsCallable(functions, "deletePost")(postId);
    };

export { createPost as default };
