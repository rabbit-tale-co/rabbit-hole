import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UseManualImpressionOptions {
  minGapSeconds?: number;
}

export function useManualImpression({ minGapSeconds = 30 }: UseManualImpressionOptions = {}) {
  const recordImpression = useCallback(async (postId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();

      // Generate anonKey for anonymous session
      let anonKey: string | null = null;
      if (!session.session) {
        anonKey = localStorage.getItem('rabbit-hole-anon-key') || crypto.randomUUID();
        if (!localStorage.getItem('rabbit-hole-anon-key')) {
          localStorage.setItem('rabbit-hole-anon-key', anonKey);
        }
      }

      const { data, error } = await supabase.rpc('record_post_view', {
        p_post_id: postId,
        p_anon_key: anonKey,
        p_min_gap_secs: minGapSeconds
      });

      if (error) {
        console.error('Failed to record manual post impression:', error);
        return false;
      }

      if (data && data[0]) {
        const result = data[0] as { inserted: boolean; views_total: number; unique_viewers: number };
        if (result.inserted) {
          console.log(`Manual impression recorded for post ${postId}: ${result.views_total} total views, ${result.unique_viewers} unique viewers`);
        }
        return result.inserted;
      }

      return false;
    } catch (error) {
      console.error('Error recording manual post impression:', error);
      return false;
    }
  }, [minGapSeconds]);

  return { recordImpression };
}
