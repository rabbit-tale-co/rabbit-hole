"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";

export interface PostStats {
  views_total: number;
  unique_viewers: number;
  last_view_at: string | null;
}

export function usePostStatsLazy(postId: string) {
  const [stats, setStats] = useState<PostStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!user || stats || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Get JWT token from Supabase session
      const { data: { session } } = await import("@/lib/supabase").then(m => m.supabase.auth.getSession());
      const token = session?.access_token;

      if (!token) {
        setError("No authentication token");
        return;
      }

      const response = await fetch(`/api/posts/${postId}/stats`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error("Error fetching post stats:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch post stats");
    } finally {
      setLoading(false);
    }
  }, [postId, user, stats, loading]);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
}
