"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

export interface FollowStats {
	isFollowing: boolean;
	followers: number;
	following: number;
}

export function useFollowStats(userId: string) {
	const [followStats, setFollowStats] = useState<FollowStats | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { user } = useAuth();

	const fetchFollowStats = useCallback(async () => {
		if (!user || followStats || loading) return;

		setLoading(true);
		setError(null);

		try {
			// Get JWT token from Supabase session
			const {
				data: { session },
			} = await import("@/lib/supabase").then((m) =>
				m.supabase.auth.getSession(),
			);
			const token = session?.access_token;

			if (!token) {
				setError("No authentication token");
				return;
			}

			const response = await fetch(`/api/users/${userId}/follow-stats`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.json();
			setFollowStats(data.followStats);
		} catch (err) {
			console.error("Error fetching follow stats:", err);
			setError(
				err instanceof Error ? err.message : "Failed to fetch follow stats",
			);
		} finally {
			setLoading(false);
		}
	}, [userId, user, followStats, loading]);

	return {
		followStats,
		loading,
		error,
		fetchFollowStats,
	};
}
