"use client";

import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	useTransition,
} from "react";
import { toast } from "sonner";
import { getFollowStats, toggleFollow } from "@/app/actions/follow";
import { useAuth } from "@/providers/AuthProvider";

export function useFollowLazy(targetUserId?: string | null, enabled = false) {
	const { user } = useAuth();
	const [isFollowing, setIsFollowing] = useState(false);
	const [followers, setFollowers] = useState(0);
	const [following, setFollowing] = useState(0);
	const [loading, setLoading] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [loaded, setLoaded] = useState(false);

	// derive "canFollow"
	const canFollow = useMemo(() => {
		if (!targetUserId) return false;
		if (!user?.id) return false;
		if (user.id === targetUserId) return false;
		return true;
	}, [targetUserId, user?.id]);

	// Lazy load follow stats only when enabled
	useEffect(() => {
		let cancelled = false;
		if (!targetUserId || !enabled || loaded) return;

		setLoading(true);
		getFollowStats(targetUserId, user?.id)
			.then((stats) => {
				if (cancelled) return;
				setIsFollowing(stats.isFollowing);
				setFollowers(stats.followers);
				setFollowing(stats.following);
				setLoaded(true);
			})
			.catch((error) => {
				if (cancelled) return;
				console.error("Failed to fetch follow stats:", error);
				toast.error("Failed to load follow stats");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [targetUserId, user?.id, enabled, loaded]);

	const handleToggleFollow = useCallback(() => {
		if (!targetUserId || !canFollow || isPending || !user?.id) return;

		startTransition(async () => {
			try {
				const result = await toggleFollow(targetUserId, user.id);
				if (result.ok) {
					setIsFollowing(result.isFollowing);
					setFollowers(result.followers);
					setFollowing(result.following);
				} else {
					toast.error(result.error || "Failed to update follow status");
				}
			} catch (error) {
				console.error("Toggle follow error:", error);
				toast.error("Failed to update follow status");
			}
		});
	}, [targetUserId, canFollow, isPending, user?.id]);

	return {
		isFollowing,
		followers,
		following,
		loading: loading || isPending,
		canFollow,
		toggleFollow: handleToggleFollow,
		loaded,
	};
}
