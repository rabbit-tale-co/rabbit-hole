// hooks/useFollow.ts
'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { getFollowStats, toggleFollow } from '@/app/actions/follow';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

export function useFollow(targetUserId?: string | null, initialStats?: { isFollowing: boolean; followers: number; following: number }) {
  const { user } = useAuth(); // if your AuthProvider exposes `user` (or `profile.user_id`)
  const [isFollowing, setIsFollowing] = useState(initialStats?.isFollowing ?? false);
  const [followers, setFollowers] = useState(initialStats?.followers ?? 0);
  const [following, setFollowing] = useState(initialStats?.following ?? 0);
  const [loading, setLoading] = useState(Boolean(targetUserId && !initialStats));
  const [isPending, startTransition] = useTransition();

  // derive "canFollow"
  const canFollow = useMemo(() => {
    if (!targetUserId) return false;
    if (!user?.id) return false;
    if (user.id === targetUserId) return false;
    return true;
  }, [targetUserId, user?.id]);

  useEffect(() => {
    let cancelled = false;
    if (!targetUserId || initialStats) return; // Skip if we have initial stats

    setLoading(true);
    getFollowStats(targetUserId, user?.id)
      .then((snap) => {
        if (cancelled) return;
        setIsFollowing(snap.isFollowing);
        setFollowers(snap.followers);
        setFollowing(snap.following);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [targetUserId, user?.id, initialStats]);

  const onToggle = useCallback(() => {
    if (!targetUserId) return;

    // Store previous state for rollback
    const prevIsFollowing = isFollowing;
    const prevFollowers = followers;

    // Optimistic update
    setIsFollowing((prev) => {
      const next = !prev;
      setFollowers((f) => (next ? f + 1 : Math.max(0, f - 1)));
      return next;
    });

    startTransition(async () => {
      if (!user?.id) {
        toast.error('Please log in to follow users');
        return;
      }

      const res = await toggleFollow(targetUserId, user.id);

      if (res.ok) {
        // Success - reconcile with server state
        setIsFollowing(res.isFollowing);
        setFollowers(res.followers);
        setFollowing(res.following);

        // Show success toast
        toast.success(res.isFollowing ? 'Following user' : 'Unfollowed user');
      } else {
        // Error - rollback optimistic update
        setIsFollowing(prevIsFollowing);
        setFollowers(prevFollowers);

        // Debug logging
        console.log('[useFollow] Server error:', res);

        // Show error toast
        if (res.error === 'UNAUTHORIZED') {
          toast.error('Please log in to follow users');
        } else if (res.error === 'CANNOT_FOLLOW_SELF') {
          toast.error('You cannot follow yourself');
        } else {
          toast.error(`Failed to update follow status: ${res.error || 'Unknown error'}`);
        }
      }
    });
  }, [targetUserId, user?.id, isFollowing, followers]);

  return {
    loading: loading || isPending,
    isFollowing,
    followers,
    following,
    canFollow,
    toggleFollow: onToggle,
  };
}
