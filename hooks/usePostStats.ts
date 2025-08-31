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
  const [stats, setStats] = useState<PostStats>({
    views_total: 0,
    unique_viewers: 0,
    last_view_at: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !postId) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        // Próbuj pobrać statystyki z różnych możliwych tabel
        const tables = ['social_art.posts_stats', 'posts_stats'];

        for (const table of tables) {
          try {
            const { data, error: fetchError } = await supabase
              .from(table)
              .select('views_total, unique_viewers, last_view_at')
              .eq('post_id', postId)
              .single();

            if (!fetchError && data) {
              setStats(data);
              return; // Sukces - wyjdź z pętli
            }

            if (fetchError && fetchError.code === 'PGRST116') {
              // Brak wierszy - post nie ma jeszcze statystyk
              return;
            }
          } catch (tableError) {
            // Tabela nie istnieje - spróbuj następną
            continue;
          }
        }

        // Jeśli żadna tabela nie działa, zostaw domyślne wartości

      } catch (err) {
        console.error('Failed to fetch post stats:', err);
        // Nie ustawiamy błędu - zostawiamy domyślne wartości
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
        setStats({
          views_total: 0,
          unique_viewers: 0,
          last_view_at: null
        });
        setError(null);
        // Trigger re-fetch
        setStats(prev => prev);
      }
    }
  };
}
