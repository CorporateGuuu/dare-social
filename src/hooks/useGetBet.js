import { useState, useEffect } from 'react';
import { getBet } from '../lib/firebase';

export function useGetBet(betId) {
  const [bet, setBet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!betId) return;

    const fetchBet = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getBet(betId);
        setBet(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBet();
  }, [betId]);

  return { bet, loading, error };
}
