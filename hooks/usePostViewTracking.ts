"use client";

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';

interface UsePostViewTrackingOptions {
  postId: string;
  enabled?: boolean;
  delay?: number; // Delay in ms before tracking the view
}

export function usePostViewTracking({
  postId,
  enabled = true,
  delay = 1000
}: UsePostViewTrackingOptions) {
  const { session } = useAuth();
  const hasTrackedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const trackView = useCallback(async () => {
    if (!enabled || hasTrackedRef.current || !postId) return;

    try {
      const response = await fetch(`/api/posts/${postId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        hasTrackedRef.current = true;
        console.log(`Tracked view for post ${postId}`);
      } else {
        console.error('Failed to track post view:', response.statusText);
      }
    } catch (error) {
      console.error('Error tracking post view:', error);
    }
  }, [postId, enabled, session?.access_token]);

  useEffect(() => {
    if (!enabled || hasTrackedRef.current || !postId) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout to track the view after the delay
    timeoutRef.current = setTimeout(() => {
      trackView();
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [trackView, delay, enabled, postId]);

  // Reset tracking when postId changes
  useEffect(() => {
    hasTrackedRef.current = false;
  }, [postId]);

  return {
    trackView,
    hasTracked: hasTrackedRef.current
  };
}
