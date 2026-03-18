import { useState, useEffect, useCallback } from 'react';

interface UsageStats {
  daily: {
    used: number;
    limit: number;
    remaining: number;
  };
  monthly: {
    used: number;
    limit: number;
    remaining: number;
  };
  plan: string;
}

export function useSubscription() {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/usage');
      const data = await response.json();

      if (response.ok) {
        setUsage(data.usage);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch usage stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const isLimitExceeded = useCallback(() => {
    if (!usage) return false;
    return usage.daily.remaining <= 0;
  }, [usage]);

  return {
    usage,
    isLoading,
    error,
    isLimitExceeded,
    refetch: fetchUsage,
  };
}
