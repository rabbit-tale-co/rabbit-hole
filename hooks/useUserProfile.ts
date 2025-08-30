"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

export type FetchedProfile = {
  user_id: string;
  username: string;
  bio?: string | null;
  display_name: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  accent_color?: string | null;
  banned_until?: string | null;
};

export function useUserProfile(username: string | undefined) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<FetchedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!username) return;
      setLoading(true);
      setError(null);
      try {
        const url = `/api/users/${encodeURIComponent(username.toString())}`;
        const res = await fetch(url);
        if (!alive) return;
        if (!res.ok) {
          setProfile(null);
          setError(`status_${res.status}`);
          return;
        }
        const data = await res.json();
        setProfile(data?.profile ?? null);
      } catch {
        if (!alive) return;
        setError("network_error");
        setProfile(null);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const onUpdated = () => load();
    window.addEventListener('profile:updated', onUpdated);
    return () => { alive = false; };
  }, [username]);

  const isOwn = useMemo(() => {
    if (!currentUser || !username) return false;
    if (profile?.user_id && currentUser.id) return currentUser.id === profile.user_id;
    const metaUsername = currentUser.user_metadata?.username as string | undefined;
    return !!metaUsername && metaUsername.toLowerCase() === username.toLowerCase();
  }, [currentUser, profile?.user_id, username]);

  return { profile, isOwn, loading, error } as const;
}
