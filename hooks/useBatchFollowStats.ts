"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

export interface BatchFollowStats {
	[userId: string]: {
		isFollowing: boolean;
		followers: number;
		following: number;
	};
}

interface UseBatchFollowStatsOptions {
	userIds: string[];
	enabled?: boolean;
	refetchInterval?: number;
}

export function useBatchFollowStats({
	userIds,
	enabled = true,
	refetchInterval,
}: UseBatchFollowStatsOptions) {
	const { user, getToken } = useAuth();
	const [stats, setStats] = useState<BatchFollowStats>({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const debounceRef = useRef<NodeJS.Timeout | null>(null);
	const inFlightRef = useRef(false);
	const lastFetchedRef = useRef<string>("");
	const cacheTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const fetchStats = useCallback(async () => {
		if (!enabled || !user?.id || userIds.length === 0) return;

		// Create a unique key for this request to avoid duplicate requests
		const requestKey = userIds.sort().join(",");

		// Skip if we already have data for these exact users
		if (lastFetchedRef.current === requestKey) {
			return;
		}

		// Skip if request is already in flight
		if (inFlightRef.current) {
			return;
		}

		// Check cache first
		try {
			const cached = localStorage.getItem(`batch-follow-stats-${requestKey}`);
			if (cached) {
				const { data: cachedData, timestamp } = JSON.parse(cached);
				// Use cache if it's less than 5 minutes old
				if (Date.now() - timestamp < 5 * 60 * 1000) {
					setStats(cachedData);
					lastFetchedRef.current = requestKey;
					return;
				}
			}
		} catch (e) {
			console.error("Error checking cache:", e);
			// Ignore cache errors
		}

		inFlightRef.current = true;
		setLoading(true);
		setError(null);

		try {
			// Get JWT token from AuthProvider
			const token = await getToken();

			if (!token) {
				setError("No authentication token");
				return;
			}

			const response = await fetch("/api/users/batch-follow-stats", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ userIds }),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.json();
			const newStats = data.stats || {};
			setStats(newStats);
			lastFetchedRef.current = requestKey;

			// Cache the results for 5 minutes
			try {
				localStorage.setItem(
					`batch-follow-stats-${requestKey}`,
					JSON.stringify({
						data: newStats,
						timestamp: Date.now(),
					}),
				);
			} catch {
				// Ignore localStorage errors
			}
		} catch (err) {
			console.error("Error fetching batch follow stats:", err);
			setError(
				err instanceof Error ? err.message : "Failed to fetch follow stats",
			);
		} finally {
			setLoading(false);
			inFlightRef.current = false;
		}
	}, [user?.id, userIds, enabled, getToken]);

	// Debounced fetch
	useEffect(() => {
		if (!enabled || userIds.length === 0) return;

		// Clear previous debounce
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		// Debounce the request by 300ms
		debounceRef.current = setTimeout(() => {
			fetchStats();
		}, 300);

		// Cleanup
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [fetchStats, enabled, userIds.length]);

	// Refetch interval
	useEffect(() => {
		if (!refetchInterval || !enabled) return;

		const interval = setInterval(fetchStats, refetchInterval);
		return () => clearInterval(interval);
	}, [fetchStats, refetchInterval, enabled]);

	// Cleanup on unmount
	useEffect(() => {
		const debounce = debounceRef.current;
		const cacheTimeout = cacheTimeoutRef.current;

		return () => {
			if (debounce) {
				clearTimeout(debounce);
			}
			if (cacheTimeout) {
				clearTimeout(cacheTimeout);
			}
			inFlightRef.current = false;
		};
	}, []);

	// Memoized individual user stats
	const getUserStats = useCallback(
		(userId: string) => {
			return (
				stats[userId] || { isFollowing: false, followers: 0, following: 0 }
			);
		},
		[stats],
	);

	// Memoized loading state for specific users
	const isLoadingUser = useCallback(
		(userId: string) => {
			return loading && !stats[userId];
		},
		[loading, stats],
	);

	// Check if we have loaded data for specific users
	const hasLoadedUser = useCallback(
		(userId: string) => {
			return stats[userId] !== undefined;
		},
		[stats],
	);

	// Check if we have loaded data for all provided user IDs
	const hasLoadedAllUsers = useCallback(() => {
		return (
			userIds.length > 0 &&
			userIds.every((userId) => stats[userId] !== undefined)
		);
	}, [userIds, stats]);

	return {
		stats,
		loading,
		error,
		refetch: fetchStats,
		getUserStats,
		isLoadingUser,
		hasLoadedUser,
		hasLoadedAllUsers,
	};
}
