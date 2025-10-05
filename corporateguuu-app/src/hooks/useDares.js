import { useEffect, useState } from "react";

/** Toggle this to swap between mock and Firebase later */
export const USE_MOCK = true;

const MOCK_DARES = [
  { id: "1", title: "Do 20 push-ups", reward: 20, desc: "Film 20 clean reps" },
  { id: "2", title: "Sing in public", reward: 30, desc: "30s clip in a cafe" },
  { id: "3", title: "Ice bucket challenge", reward: 25, desc: "Pour and smile!" },
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
