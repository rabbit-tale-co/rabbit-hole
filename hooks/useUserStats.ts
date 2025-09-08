"use client";

import { useEffect, useState } from "react";

export interface UserStats {
  posts: number;
  views: number;
}

export function useUserStats(username: string | undefined) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!username) return;
      setLoading(true);
      setError(null);
      try {
        const url = `/api/users/${encodeURIComponent(username.toString())}/stats`;
        const res = await fetch(url);
        if (!alive) return;
        if (!res.ok) {
          setStats(null);
          setError(`status_${res.status}`);
          return;
        }
        const data = await res.json();
        console.log('useUserStats data:', data);
        console.log('useUserStats setting stats:', data?.stats);
        setStats(data?.stats ?? null);
      } catch {
        if (!alive) return;
        setError("network_error");
        setStats(null);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [username]);

  return { stats, loading, error } as const;
}
