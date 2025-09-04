import { useEffect, useState } from 'react';
import { getPostStats } from '@/app/actions/posts';

interface PostStats {
  views_total: number;
  unique_viewers: number;
  last_view_at: string | null;
}

interface UsePostStatsOptions {
  postId: string;
  enabled?: boolean;
}

export function usePostStats({ postId, enabled = true }: UsePostStatsOptions) {
  const [stats, setStats] = useState<PostStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !postId) {
      console.log('usePostStats: disabled or no postId', { enabled, postId });
      return;
    }


    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use the server action to fetch stats
        const result = await getPostStats(postId);

        if (result.error) {
          setError(result.error);
          setStats(null);
        } else if (result.stats) {
          setStats(result.stats);
        }

      } catch (err) {
        console.error('usePostStats: unexpected error:', err);
        setError('Failed to fetch stats');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [postId, enabled]);

  return {
    stats,
    loading,
    error,
    refetch: () => {
      if (enabled && postId) {
        setStats(null);
        setError(null);
        // Trigger re-fetch
        setStats(prev => prev);
      }
    }
  };
}
