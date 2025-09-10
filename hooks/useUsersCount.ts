"use client";

import { useEffect, useState } from "react";

export function useUsersCount() {
	const [count, setCount] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchCount = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch("/api/users/count");
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}

				const data = await response.json();
				setCount(data.count);
			} catch (err) {
				console.error("Failed to fetch users count:", err);
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setLoading(false);
			}
		};

		fetchCount();
	}, []);

	return { count, loading, error };
}
