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
	const [currentUserProfile, setCurrentUserProfile] =
		useState<FetchedProfile | null>(null);

	useEffect(() => {
		let alive = true;
		const load = async () => {
			if (!username) return;
			setLoading(true);
			setError(null);
			try {
				const url = `/api/users/${encodeURIComponent(username)}`;
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
		window.addEventListener("profile:updated", onUpdated);
		return () => {
			alive = false;
		};
	}, [username]);

	// Load current user's profile for comparison
	useEffect(() => {
		let alive = true;
		const loadCurrentUserProfile = async () => {
			if (!currentUser?.user_metadata?.username) {
				setCurrentUserProfile(null);
				return;
			}

			try {
				const url = `/api/users/${encodeURIComponent(currentUser.user_metadata.username)}`;
				const res = await fetch(url);
				if (!alive) return;
				if (!res.ok) {
					setCurrentUserProfile(null);
					return;
				}

				if (!alive) return;

				const data = await res.json();
				setCurrentUserProfile(data?.profile ?? null);
			} catch {
				if (!alive) return;
				setCurrentUserProfile(null);
			}
		};

		loadCurrentUserProfile();
		return () => {
			alive = false;
		};
	}, [currentUser?.user_metadata?.username]);

	const isOwn = useMemo(() => {
		if (!profile) {
			return false;
		}

		if (!currentUser) {
			return false;
		}

		if (profile?.user_id && currentUserProfile?.user_id) {
			const isOwnById = currentUserProfile.user_id === profile.user_id;
			return isOwnById;
		}

		if (currentUserProfile?.username && profile?.username) {
			const isOwnByUsername =
				currentUserProfile.username.toLowerCase() ===
				profile.username.toLowerCase();
			return isOwnByUsername;
		}

		if (profile?.user_id && currentUser.id) {
			const isOwnById = currentUser.id === profile.user_id;
			return isOwnById;
		}

		return false;
	}, [
		currentUser,
		profile,
		currentUserProfile?.user_id,
		currentUserProfile?.username,
	]);

	return { profile, isOwn, loading, error } as const;
}
