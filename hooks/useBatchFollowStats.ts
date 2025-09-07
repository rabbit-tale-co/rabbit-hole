"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

export interface FollowStats {
  isFollowing: boolean;
  followers: number;
  following: number;
}

// Global cache for follow stats
const followStatsCache = new Map<string, FollowStats>();
const pendingRequests = new Set<string>();

export function useBatchFollowStats(userId: string) {
  const [followStats, setFollowStats] = useState<FollowStats | null>(
    followStatsCache.get(userId) || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async () => {
    if (followStats || loading || pendingRequests.has(userId)) return;

    // If no user is logged in, set default stats and return
    if (!user) {
      const defaultStats: FollowStats = { isFollowing: false, followers: 0, following: 0 };
      setFollowStats(defaultStats);
      return;
    }

    // Add to pending requests
    pendingRequests.add(userId);
    setLoading(true);
    setError(null);

    // Debounce requests - wait 100ms to batch them
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }

    requestTimeoutRef.current = setTimeout(async () => {
      try {
        // Get JWT token from Supabase session
        const { data: { session } } = await import("@/lib/supabase").then(m => m.supabase.auth.getSession());
        const token = session?.access_token;

        if (!token) {
          setError("No authentication token");
          return;
        }

        // Get all visible user IDs from the page
        const visibleUserIds = Array.from(
          new Set(
            Array.from(document.querySelectorAll('[data-user-id]'))
              .map(el => el.getAttribute('data-user-id'))
              .filter(Boolean) as string[]
          )
        );

        // Filter out already cached users
        const uncachedUserIds = visibleUserIds.filter(id => !followStatsCache.has(id));

        if (uncachedUserIds.length === 0) {
          // All users are already cached
          const cachedStats = followStatsCache.get(userId);
          if (cachedStats) {
            setFollowStats(cachedStats);
          }
          return;
        }

        // Batch request for all uncached users
        const response = await fetch('/api/users/batch-follow-stats', {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userIds: uncachedUserIds }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Cache all results
        for (const [id, stats] of Object.entries(data.followStats)) {
          followStatsCache.set(id, stats as FollowStats);
        }

        // Set stats for current user
        const userStats = followStatsCache.get(userId);
        if (userStats) {
          setFollowStats(userStats);
        }

      } catch (err) {
        console.error("Error fetching batch follow stats:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch follow stats");
      } finally {
        setLoading(false);
        pendingRequests.delete(userId);
      }
    }, 100);

  }, [userId, user, followStats, loading]);

  // Auto-fetch stats when component mounts
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, []);

  return {
    followStats,
    loading,
    error,
    fetchStats,
  };
}
