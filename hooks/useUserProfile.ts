"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

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
  const [currentUserProfile, setCurrentUserProfile] = useState<FetchedProfile | null>(null);

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
        console.log('[useUserProfile] API response:', { status: res.status, data });
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

  // Load current user's profile for comparison
  useEffect(() => {
    let alive = true;
    const loadCurrentUserProfile = async () => {
      if (!currentUser?.id) {
        setCurrentUserProfile(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .schema('social_art')
          .from('profiles')
          .select('user_id, username, display_name, bio, avatar_url, cover_url, accent_color, is_premium, is_admin')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (!alive) return;

        if (error) {
          console.error('[useUserProfile] Error loading current user profile:', error);
          setCurrentUserProfile(null);
        } else {
          console.log('[useUserProfile] Current user profile loaded:', data);
          setCurrentUserProfile(data as FetchedProfile | null);
        }
      } catch (err) {
        if (!alive) return;
        console.error('[useUserProfile] Exception loading current user profile:', err);
        setCurrentUserProfile(null);
      }
    };

    loadCurrentUserProfile();
    return () => { alive = false; };
  }, [currentUser?.id]);

  const isOwn = useMemo(() => {
    if (!currentUser || !username) {
      console.log('[useUserProfile] isOwn check: no currentUser or username', { currentUser: !!currentUser, username });
      return false;
    }

    // Debug: sprawdź co mamy w currentUserProfile
    console.log('[useUserProfile] currentUserProfile debug:', {
      user_id: currentUserProfile?.user_id,
      username: currentUserProfile?.username
    });

    // Debug: sprawdź co mamy w profile
    console.log('[useUserProfile] profile debug:', {
      user_id: profile?.user_id,
      username: profile?.username
    });

    // Porównaj user_id
    if (profile?.user_id && currentUserProfile?.user_id) {
      const isOwnById = currentUserProfile.user_id === profile.user_id;
      console.log('[useUserProfile] isOwn check by ID:', {
        currentUserProfileId: currentUserProfile.user_id,
        profileUserId: profile.user_id,
        isOwnById
      });
      return isOwnById;
    }

    // Porównaj username
    if (currentUserProfile?.username && profile?.username) {
      const isOwnByUsername = currentUserProfile.username.toLowerCase() === profile.username.toLowerCase();
      console.log('[useUserProfile] isOwn check by username:', {
        currentUserProfileUsername: currentUserProfile.username,
        profileUsername: profile.username,
        isOwnByUsername
      });
      return isOwnByUsername;
    }

    // Fallback: porównaj currentUser.id z profile.user_id
    if (profile?.user_id && currentUser.id) {
      const isOwnById = currentUser.id === profile.user_id;
      console.log('[useUserProfile] isOwn check by currentUser.id:', {
        currentUserId: currentUser.id,
        profileUserId: profile.user_id,
        isOwnById
      });
      return isOwnById;
    }

    console.log('[useUserProfile] isOwn check: no match found');
    return false;
  }, [currentUser, currentUserProfile, profile?.user_id, profile?.username, username]);

  return { profile, isOwn, loading, error } as const;
}
