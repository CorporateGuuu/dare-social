import { useEffect, useState } from "react";

/** Toggle this to swap between mock and Firebase later */
export const USE_MOCK = true;

const MOCK_DARES = [
  {
    id: "1",
    title: "Do 20 push-ups",
    description: "Film 20 clean reps",
    mediaUrl: "https://example.com/pushups.jpg",
    creatorId: "mock-creator-1",
    participants: [],
    status: "open",
    wagerType: "1v1",
    wagerAmount: 20,
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: "2",
    title: "Sing in public",
    description: "30s clip in a cafe",
    mediaUrl: "https://example.com/sing.jpg",
    creatorId: "mock-creator-2",
    participants: ["mock-user-1"],
    status: "active",
    wagerType: "none",
    wagerAmount: 30,
    createdAt: new Date().toISOString(),
    completedAt: null,
  },
  {
    id: "3",
    title: "Ice bucket challenge",
    description: "Pour and smile!",
    mediaUrl: "https://example.com/ice.jpg",
    creatorId: "mock-creator-3",
    participants: [],
    status: "completed",
    wagerType: "group",
    wagerAmount: 25,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  },
];

export function useDares() {
  const [dares, setDares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setTimeout(() => {
        setDares(MOCK_DARES);
        setLoading(false);
      }, 300);
    }
  }, []);

  return { dares, loading };
}
