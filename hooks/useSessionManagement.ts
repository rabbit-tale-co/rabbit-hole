"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export interface SessionInfo {
	id: string;
	device_info: string;
	ip_address: string;
	created_at: string;
	last_activity: string;
	is_current: boolean;
	location?: string;
}

export interface SessionsResponse {
	sessions: SessionInfo[];
	total: number;
}

export function useSessionManagement() {
	const [sessions, setSessions] = useState<SessionInfo[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Pobierz JWT token
	const getAuthToken = async (): Promise<string | null> => {
		try {
			// Try getSession first
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session?.access_token) {
				return session.access_token;
			}

			// If no session, try to refresh
			const {
				data: { session: refreshedSession },
			} = await supabase.auth.refreshSession();
			if (refreshedSession?.access_token) {
				return refreshedSession.access_token;
			}

			console.error("No valid session found");
			return null;
		} catch (error) {
			console.error("Error getting auth token:", error);
			return null;
		}
	};

	// Pobierz wszystkie sesje
	const fetchSessions = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const token = await getAuthToken();
			console.log("Session token:", token ? "Found" : "Not found");

			if (!token) {
				throw new Error("No authentication token");
			}

			console.log("Fetching sessions from /api/sessions");
			const response = await fetch("/api/sessions", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			console.log("Sessions response status:", response.status);

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Sessions API error:", errorData);
				throw new Error(errorData.error || "Failed to fetch sessions");
			}

			const data: SessionsResponse = await response.json();
			console.log("Sessions data:", data);
			setSessions(data.sessions);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error";
			console.error("Fetch sessions error:", err);
			setError(errorMessage);
			toast.error(`Failed to load sessions: ${errorMessage}`);
		} finally {
			setLoading(false);
		}
	}, []);

	// Usuń konkretną sesję
	const revokeSession = async (sessionId: string) => {
		try {
			const token = await getAuthToken();
			if (!token) {
				throw new Error("No authentication token");
			}

			const response = await fetch(`/api/sessions?sessionId=${sessionId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to revoke session");
			}

			// Odśwież listę sesji
			await fetchSessions();
			toast.success("Session has been revoked");
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error";
			toast.error(`Failed to revoke session: ${errorMessage}`);
		}
	};

	// Usuń wszystkie inne sesje
	const revokeAllOtherSessions = async () => {
		try {
			const token = await getAuthToken();
			if (!token) {
				throw new Error("No authentication token");
			}

			const response = await fetch("/api/sessions?revokeAll=true", {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to revoke sessions");
			}

			// Odśwież listę sesji
			await fetchSessions();
			toast.success("All other sessions have been revoked");
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error";
			toast.error(`Failed to revoke sessions: ${errorMessage}`);
		}
	};

	// Formatuj datę
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Formatuj czas względny
	const formatRelativeTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMinutes = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60),
		);

		if (diffInMinutes < 1) return "Just now";
		if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) return `${diffInHours} hours ago`;

		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays < 7) return `${diffInDays} days ago`;

		return formatDate(dateString);
	};

	// Pobierz sesje przy montowaniu komponentu
	useEffect(() => {
		fetchSessions();
	}, [fetchSessions]);

	return {
		sessions,
		loading,
		error,
		fetchSessions,
		revokeSession,
		revokeAllOtherSessions,
		formatDate,
		formatRelativeTime,
	};
}
