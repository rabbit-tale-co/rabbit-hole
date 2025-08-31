import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface UsePostImpressionsOptions {
  postId: string;
  minGapSeconds?: number;
}

interface PostImpressionResult {
  inserted: boolean;
  views_total: number;
  unique_viewers: number;
}

export function usePostImpressions({ postId, minGapSeconds = 30 }: UsePostImpressionsOptions) {
  const hasRecordedRef = useRef(false);
  const lastRecordedRef = useRef<number>(0);

  // Generate anonKey for anonymous session
  const getAnonKey = useCallback(() => {
    // Check if we already have anonKey in localStorage
    let anonKey = localStorage.getItem('rabbit-hole-anon-key');

    if (!anonKey) {
      // Generate new UUID
      anonKey = crypto.randomUUID();
      localStorage.setItem('rabbit-hole-anon-key', anonKey);
    }

    return anonKey;
  }, []);

  // Record post impression
  const recordImpression = useCallback(async () => {
    if (hasRecordedRef.current) return;

    const now = Date.now();
    const timeSinceLastRecord = now - lastRecordedRef.current;

    // Check if enough time has passed
    if (timeSinceLastRecord < (minGapSeconds * 1000)) {
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      const anonKey = session.session ? null : getAnonKey();

      const { data, error } = await supabase.rpc('record_post_view', {
        p_post_id: postId,
        p_anon_key: anonKey,
        p_min_gap_secs: minGapSeconds
      });

             if (error) {
         console.error('Failed to record post impression:', error);
         if (error.message?.includes('relation') || error.message?.includes('schema')) {
           console.info(`Post ${postId}: Stats table not available yet, skipping impression recording`);
         }
         return;
       }

      if (data && data[0]) {
        const result = data[0] as PostImpressionResult;
        if (result.inserted) {
          hasRecordedRef.current = true;
          lastRecordedRef.current = now;
          console.log(`Post ${postId} impression recorded: ${result.views_total} total views, ${result.unique_viewers} unique viewers`);
        }
      }
    } catch (error) {
      console.error('Error recording post impression:', error);
    }
  }, [postId, minGapSeconds, getAnonKey]);

  // Automatically record impression when post becomes visible
  useEffect(() => {
    if (!postId) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRecordedRef.current) {
          // Add small delay to ensure post is actually visible
          setTimeout(() => {
            recordImpression();
          }, 500);
        }
      },
      {
        threshold: 0.5, // Post must be 50% visible
        rootMargin: '0px'
      }
    );

    // Observe element with postId (we can use data-post-id)
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
      observer.observe(postElement);
    }

    return () => {
      observer.disconnect();
    };
  }, [postId, recordImpression]);

  return {
    recordImpression,
    hasRecorded: hasRecordedRef.current
  };
}
