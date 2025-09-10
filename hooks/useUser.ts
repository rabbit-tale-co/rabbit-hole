"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Types
export interface UserProfile {
  user_id: string;
  username: string;
  bio?: string | null;
  display_name: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  accent_color?: string | null;
  banned_until?: string | null;
  is_premium?: boolean;
}

export interface UserStats {
  posts: number;
  views: number;
  following: number;
  followers: number;
}

export interface SubscriptionStatus {
  isPremium: boolean;
  subscriptionStatus: string;
  plan: string | null;
  nextBillingDate: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  lastChecked: string;
}

export interface BillingInfo {
  is_premium: boolean;
  premium_plan?: string;
  premium_status?: string;
  premium_started_at?: string;
  last_payment_at?: string;
}

// Main useUser hook that consolidates all user-related functionality
export function useUser() {
  const { user, profile, getToken, refreshProfile } = useAuth();

  // Profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Stats state
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Subscription state
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isPremium: false,
    subscriptionStatus: "none",
    plan: null,
    nextBillingDate: null,
    customerId: null,
    subscriptionId: null,
    lastChecked: "",
  });
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Billing state
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  // Fetch user profile by username
  const fetchUserProfile = useCallback(async (username: string) => {
    if (!username) return;

    setProfileLoading(true);
    setProfileError(null);

    try {
      const url = `/api/users/${encodeURIComponent(username)}`;
      const res = await fetch(url);

      if (!res.ok) {
        setUserProfile(null);
        setProfileError(`status_${res.status}`);
        return;
      }

      const data = await res.json();
      setUserProfile(data?.profile ?? null);
    } catch {
      setProfileError("network_error");
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Fetch user stats by username
  const fetchUserStats = useCallback(async (username: string) => {
    if (!username) return;

    setStatsLoading(true);
    setStatsError(null);

    try {
      const url = `/api/users/${encodeURIComponent(username)}/stats`;
      const res = await fetch(url);

      if (!res.ok) {
        setUserStats(null);
        setStatsError(`status_${res.status}`);
        return;
      }

      const data = await res.json();
      setUserStats(data?.stats ?? null);
    } catch {
      setStatsError("network_error");
      setUserStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch subscription status
  const fetchSubscriptionStatus = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setSubscriptionStatus(prev => ({
        ...prev,
        loading: false,
        error: "No user logged in",
      }));
      return;
    }

    setSubscriptionLoading(true);
    setSubscriptionError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const method = forceRefresh ? "POST" : "GET";
      const response = await fetch(
        `/api/user/subscription-status?userId=${user.id}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            ...(forceRefresh ? { "Content-Type": "application/json" } : {}),
          },
          body: forceRefresh
            ? JSON.stringify({ userId: user.id })
            : undefined,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to check subscription status: ${response.status}`,
        );
      }

      const data = await response.json();

      setSubscriptionStatus({
        isPremium: data.isPremium,
        subscriptionStatus: data.subscriptionStatus,
        plan: data.plan,
        nextBillingDate: data.nextBillingDate,
        customerId: data.customerId,
        subscriptionId: data.subscriptionId,
        lastChecked: data.lastChecked,
      });
    } catch (error) {
      console.error("Subscription status check error:", error);
      setSubscriptionError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setSubscriptionLoading(false);
    }
  }, [user?.id, getToken]);

  // Fetch billing info
  const fetchBillingInfo = useCallback(async () => {
    if (!user?.id) return;

    setBillingLoading(true);
    setBillingError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(`/api/user/subscription-status?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBillingInfo({
          is_premium: data.isPremium || false,
          premium_plan: data.plan || undefined,
          premium_status: data.subscriptionStatus || 'none',
          premium_started_at: data.profile?.is_premium ? new Date().toISOString() : undefined,
          last_payment_at: data.nextBillingDate || undefined,
        });
      }
    } catch (error) {
      console.error('Failed to fetch billing info:', error);
      setBillingError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setBillingLoading(false);
    }
  }, [user?.id, getToken]);

  // Handle subscription status changes from URL params
  const handleSubscriptionStatusChange = useCallback(async (searchParams: URLSearchParams) => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const sessionId = searchParams.get("session_id");

    if (success && sessionId) {
      toast.success("Your subscription is now active.");

      const syncPremiumStatus = async () => {
        try {
          const token = await getToken();
          if (!token) {
            console.error('❌ No authentication token available for sync');
            return;
          }

          const response = await fetch("/api/user/subscription-status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
          });

          if (response.ok) {
            fetchSubscriptionStatus();
          }
        } catch (error) {
          console.error("Failed to sync premium status:", error);
        }
      };

      setTimeout(syncPremiumStatus, 2000);
    } else if (canceled) {
      toast.error("Payment was canceled. You can try again anytime.");
    }
  }, [getToken, fetchSubscriptionStatus]);

  // Handle auth confirmation
  const handleAuthConfirm = useCallback(async (token_hash: string, type: string, next: string = "/auth/update-password") => {
    if (!token_hash || !type) {
      throw new Error("Missing token parameters.");
    }

    if (type === "recovery") {
      const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash });
      if (error) {
        throw new Error(error.message || "Invalid or expired recovery link.");
      }
      return { success: true, redirectTo: next };
    }

    if (type === "signup") {
      const { error } = await supabase.auth.verifyOtp({ type: "signup", token_hash });
      if (error) {
        throw new Error(error.message || "Invalid or expired confirmation link.");
      }
      return { success: true, redirectTo: "/" };
    }

    throw new Error("Unsupported confirmation type.");
  }, []);

  // Handle post fetching
  const fetchPost = useCallback(async (postId: string) => {
    try {
      const r = await fetch(`/api/posts/${encodeURIComponent(postId)}`, { cache: "no-store" });
      const j = await r.json();

      if (!r.ok) {
        throw new Error(j?.error || `status_${r.status}`);
      }

      return { post: j.post, author: j.author };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "network_error");
    }
  }, []);

  // Handle post deletion
  const deletePost = useCallback(async (postId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("Not authenticated");
      }

      const r = await fetch(`/api/posts/${postId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ _action: "delete" })
      });

      if (!r.ok) throw new Error("delete_failed");

      toast.success("Post deleted");
      return { success: true };
    } catch (error) {
      console.error("Delete post error:", error);
      toast.error("Failed to delete post");
      throw error;
    }
  }, []);

  // Handle copy link functionality
  const copyLink = useCallback(async (postId: string) => {
    try {
      const url = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  }, []);

  // Handle manage subscription
  const manageSubscription = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to open billing portal');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Something went wrong. Please try again.');
    }
  }, [user?.id]);

  // Computed values
  const isOwnProfile = useMemo(() => {
    if (!userProfile || !user) return false;
    return userProfile.user_id === user.id;
  }, [userProfile, user]);

  const isPremium = useMemo(() => {
    return subscriptionStatus.isPremium || Boolean(profile?.is_premium);
  }, [subscriptionStatus.isPremium, profile?.is_premium]);

  // Auto-refresh subscription status every 5 minutes
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchSubscriptionStatus();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user?.id, fetchSubscriptionStatus]);

  // Listen for profile updates
  useEffect(() => {
    const onUpdated = () => {
      if (userProfile) {
        fetchUserProfile(userProfile.username);
      }
    };

    window.addEventListener("profile:updated", onUpdated);
    return () => window.removeEventListener("profile:updated", onUpdated);
  }, [userProfile, fetchUserProfile]);

  return {
    // Profile
    userProfile,
    profileLoading,
    profileError,
    fetchUserProfile,

    // Stats
    userStats,
    statsLoading,
    statsError,
    fetchUserStats,

    // Subscription
    subscriptionStatus,
    subscriptionLoading,
    subscriptionError,
    fetchSubscriptionStatus,

    // Billing
    billingInfo,
    billingLoading,
    billingError,
    fetchBillingInfo,

    // Actions
    handleSubscriptionStatusChange,
    handleAuthConfirm,
    fetchPost,
    deletePost,
    copyLink,
    manageSubscription,

    // Computed
    isOwnProfile,
    isPremium,

    // Auth context
    user,
    profile,
    getToken,
    refreshProfile,
  };
}

// Hook for author profiles caching (used in Feed)
export function useAuthorProfiles(authorIds: string[]) {
  const [authorProfiles, setAuthorProfiles] = useState<
    Map<
      string,
      {
        user_id: string;
        username: string;
        display_name: string;
        bio: string | null;
        avatar_url: string;
        cover_url?: string;
        is_premium?: boolean;
      }
    >
  >(new Map());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthorProfiles = useCallback(async (missingIds: string[]) => {
    if (missingIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await supabase
        .from("profiles")
        .select("user_id,username,avatar_url,cover_url,display_name,bio,is_premium")
        .in("user_id", missingIds);

      if (!data) return;

      setAuthorProfiles((prev) => {
        const next = new Map(prev);
        for (const row of data) {
          next.set(row.user_id, {
            user_id: row.user_id,
            username: row.username,
            avatar_url: row.avatar_url,
            cover_url: row.cover_url,
            display_name: row.display_name,
            bio: row.bio,
            is_premium: (row as { is_premium?: boolean }).is_premium,
          });
        }
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch author profiles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const missing = authorIds.filter((id) => !authorProfiles.has(id));
    if (missing.length > 0) {
      fetchAuthorProfiles(missing);
    }
  }, [authorIds, authorProfiles, fetchAuthorProfiles]);

  return {
    authorProfiles,
    loading,
    error,
    fetchAuthorProfiles,
  };
}
