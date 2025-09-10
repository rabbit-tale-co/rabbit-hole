"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

export interface FollowStats {
	isFollowing: boolean;
	followers: number;
	following: number;
}

// Global cache for follow stats
const followStatsCache = new Map<string, FollowStats>();
let globalTimeoutRef: NodeJS.Timeout | null = null;
let isFetching = false;
const subscribers = new Set<() => void>();

// Global function to fetch stats for all visible users
const fetchAllVisibleStats = async (user: { id: string } | null) => {
	if (!user || isFetching) return;

	isFetching = true;

	try {
		// Get JWT token from Supabase session
		const {
			data: { session },
		} = await import("@/lib/supabase").then((m) =>
			m.supabase.auth.getSession(),
		);
		const token = session?.access_token;

		if (!token) {
			console.error("No authentication token for follow stats");
			return;
		}

		// Get all visible user IDs from the page
		const visibleUserIds = Array.from(
			new Set(
				Array.from(document.querySelectorAll("[data-user-id]"))
					.map((el) => el.getAttribute("data-user-id"))
					.filter(Boolean) as string[],
			),
		);

		// Filter out already cached users
		const uncachedUserIds = visibleUserIds.filter(
			(id) => !followStatsCache.has(id),
		);

		if (uncachedUserIds.length === 0) {
			console.log("All users already cached");
			return;
		}

		console.log(`Fetching follow stats for ${uncachedUserIds.length} users`);

		// Batch request for all uncached users
		const response = await fetch("/api/users/batch-follow-stats", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ userIds: uncachedUserIds }),
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const data = await response.json();

		// Cache all results
		if (data.followStats && typeof data.followStats === "object") {
			for (const [id, stats] of Object.entries(data.followStats)) {
				followStatsCache.set(id, stats as FollowStats);
			}
		}

		console.log(
			`Cached follow stats for ${data.followStats ? Object.keys(data.followStats).length : 0} users`,
		);

		// Notify all subscribers
		subscribers.forEach((callback) => callback());
	} catch (err) {
		console.error("Error fetching batch follow stats:", err);
	} finally {
		isFetching = false;
	}
};

export function useGlobalFollowStats(userId: string) {
	const [followStats, setFollowStats] = useState<FollowStats | null>(
		followStatsCache.get(userId) || null,
	);
	const [loading, setLoading] = useState(false);
	const { user } = useAuth();

	const updateStats = useCallback(() => {
		const cachedStats = followStatsCache.get(userId);
		if (cachedStats) {
			setFollowStats(cachedStats);
		}
	}, [userId]);

	// Global debounced fetch function
	const triggerGlobalFetch = useCallback(() => {
		if (!user) {
			// If no user is logged in, set default stats
			const defaultStats: FollowStats = {
				isFollowing: false,
				followers: 0,
				following: 0,
			};
			setFollowStats(defaultStats);
			return;
		}

		// Clear existing timeout
		if (globalTimeoutRef) {
			clearTimeout(globalTimeoutRef);
		}

		// Set new timeout for global fetch
		globalTimeoutRef = setTimeout(async () => {
			setLoading(true);
			await fetchAllVisibleStats(user);
			setLoading(false);
		}, 300); // Increased debounce time
	}, [user]);

	// Subscribe to cache updates
	useEffect(() => {
		const callback = () => updateStats();
		subscribers.add(callback);

		return () => {
			subscribers.delete(callback);
		};
	}, [updateStats]);

	// Auto-trigger fetch when component mounts (only once globally)
	useEffect(() => {
		if (globalTimeoutRef === null) {
			triggerGlobalFetch();
		}
	}, [triggerGlobalFetch]);

	return {
		followStats,
		loading,
	};
}
