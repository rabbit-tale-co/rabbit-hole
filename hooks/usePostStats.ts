import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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
    if (!enabled || !postId) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('social_art.posts_stats')
          .select('views_total, unique_viewers, last_view_at')
          .eq('post_id', postId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No rows returned - post has no stats yet
            setStats({
              views_total: 0,
              unique_viewers: 0,
              last_view_at: null
            });
          } else {
            throw fetchError;
          }
        } else {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch post stats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
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
        // Trigger re-fetch by changing dependency
        setStats(prev => prev);
      }
    }
  };
}
