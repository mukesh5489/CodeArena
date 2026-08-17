/**
 * useApi.js – Generic custom hook for making API calls
 *
 * Usage:
 *   const { data, loading, error } = useApi('/health');
 *
 * The hook automatically fires on mount and manages loading/error state.
 */

import { useState, useEffect } from 'react';
import api from '../services/api';

export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false; // prevents state updates if component unmounts

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(endpoint);
        if (!cancelled) {
          setData(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || 'Something went wrong');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  return { data, loading, error };
}
