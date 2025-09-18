"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PostRow } from "@/types";
import { ProfileFeedType } from "@/components/user/ProfileFeedSelector";

type Page = { items: PostRow[]; nextCursor: string | null };

// Global state to prevent multiple simultaneous requests
let globalInFlight = false;

export function useInfiniteFeed(
	initial?: Page,
	pageSize = 24,
	opts?: { username?: string; following?: boolean; rabbitHole?: string; profileFeedType?: ProfileFeedType },
) {
	const [pages, setPages] = useState<Page[]>(initial ? [initial] : []);
	const [cursor, setCursor] = useState<string | null | "">(
		initial ? (initial.nextCursor ?? null) : "",
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const inFlight = useRef(false);
	const mounted = useRef(true);
	const hasAutoLoaded = useRef(!!initial);
	const cursorRef = useRef(cursor);
	const abortRef = useRef<AbortController | null>(null);
	const sameTokenHits = useRef(0);

	// Listen for refresh events
	useEffect(() => {
		const handleRefresh = () => {
			setPages([]);
			setCursor("");
			setError(null);
			hasAutoLoaded.current = false;
		};

		window.addEventListener("feed-refresh", handleRefresh);
		return () => window.removeEventListener("feed-refresh", handleRefresh);
	}, []);

	useEffect(() => {
		cursorRef.current = cursor;
	}, [cursor]);

	const items = useMemo(() => {
		const map = new Map<string, PostRow>();
		for (const p of pages) for (const it of p.items) map.set(it.id, it);
		return Array.from(map.values());
	}, [pages]);

	const loadMore = useCallback(async () => {
		if (
			inFlight.current ||
			globalInFlight ||
			cursorRef.current === null ||
			!mounted.current
		) {
			return;
		}

		if (!mounted.current) {
			return;
		}

		inFlight.current = true;
		globalInFlight = true;
		setLoading(true);
		setError(null);

		const currentCursor = cursorRef.current;
		const cursorParam = currentCursor === "" ? undefined : currentCursor;

		// Decode cursor to get id and created_at
		let cursorId: string | undefined;
		let cursorCreatedAt: string | undefined;
		if (cursorParam) {
			try {
				const [ts, id] = Buffer.from(cursorParam, "base64").toString("utf8").split("|");
				cursorId = id;
				cursorCreatedAt = ts;
			} catch {
				// Invalid cursor, ignore
			}
		}

		const qs = new URLSearchParams();
		qs.set("take", String(pageSize));
		if (cursorId) qs.set("id", cursorId);
		if (cursorCreatedAt) qs.set("created_at", cursorCreatedAt);
		if (opts?.username) qs.set("username", opts.username);
		if (opts?.following) qs.set("following", "true");
		if (opts?.rabbitHole) qs.set("rabbitHole", opts.rabbitHole);
		if (opts?.profileFeedType) qs.set("profileFeedType", opts.profileFeedType);
		const url = `/api/posts${qs.toString() ? `?${qs.toString()}` : ""}`;


		// Abort any existing request
		if (abortRef.current) {
			abortRef.current.abort();
		}

		// Create new abort controller for this request
		const ac = new AbortController();
		abortRef.current = ac;

		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			const accessToken = session?.access_token;

			const r = await fetch(url, {
				cache: "no-store",
				headers: accessToken
					? { Authorization: `Bearer ${accessToken}` }
					: undefined,
				signal: ac.signal,
			});

			if (!mounted.current) {
				return;
			}

			if (!r.ok) {
				const body = await r.json().catch(() => ({}));
				throw new Error(body?.error || `status_${r.status}`);
			}

			const res = (await r.json()) as {
				items?: PostRow[];
				nextCursor?: string | null;
				nextId?: string | null;
				nextCreatedAt?: string | null;
			};

			const next = ("nextCursor" in res ? res.nextCursor : null) ?? null;

			if (next && next === currentCursor) {
				sameTokenHits.current += 1;
			} else {
				sameTokenHits.current = 0;
			}

			const itemsCount = res.items?.length ?? 0;
			const reachedEnd =
				next === null || sameTokenHits.current >= 3 || itemsCount < pageSize;
			const finalNext = reachedEnd ? null : next;

			if (!mounted.current) {
				return;
			}

			setPages((prev) => [
				...prev,
				{ items: res.items ?? [], nextCursor: finalNext },
			]);
			setCursor(finalNext);
			setLoading(false);
		} catch (e: unknown) {
			if (e instanceof Error && e.name === "AbortError") {
				return;
			}

			if (!mounted.current) {
				return;
			}

			if (e instanceof Error) {
				setError(e.message);
			} else {
				setError("Unknown error occurred");
			}
			setLoading(false);
		} finally {
			// Only update state if this request wasn't aborted
			if (mounted.current && !ac.signal.aborted) {
				// setLoading(false) moved to success case
			}
			inFlight.current = false;
			globalInFlight = false;

			// Clear abort controller if this is the current one
			if (abortRef.current === ac) {
				abortRef.current = null;
			}
		}
	}, [pageSize, opts?.username, opts?.following, opts?.rabbitHole, opts?.profileFeedType]);

	const hasMore = cursor !== null;

	useEffect(() => {
		if (!hasAutoLoaded.current && cursor === "" && mounted.current) {
			hasAutoLoaded.current = true;
			setTimeout(() => {
				if (mounted.current) {
					void loadMore();
				}
			}, 100);
		}
	}, [cursor, loadMore]);

	useEffect(() => {
		setPages(initial ? [initial] : []);
		setCursor(initial ? (initial.nextCursor ?? null) : "");
		hasAutoLoaded.current = !!initial;
		sameTokenHits.current = 0;
	}, [initial]);

	// Reset feed when opts change (username, following, rabbitHole, profileFeedType)
	useEffect(() => {
		console.log("[useInfiniteFeed] opts changed:", opts);
		console.log("[useInfiniteFeed] profileFeedType:", opts?.profileFeedType);

		// Abort any ongoing request
		if (abortRef.current) {
			abortRef.current.abort();
		}

		setPages([]);
		setCursor("");
		hasAutoLoaded.current = false;
		sameTokenHits.current = 0;
		setError(null);
		setLoading(false);
		inFlight.current = false;
		globalInFlight = false;
	}, [opts?.username, opts?.following, opts?.rabbitHole, opts?.profileFeedType]);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			if (abortRef.current) {
				abortRef.current.abort();
				abortRef.current = null;
			}
		};
	}, []);

	const refresh = useCallback(async () => {
		if (!mounted.current) {
			return;
		}

		setPages([]);
		setCursor("");
		hasAutoLoaded.current = false;
		sameTokenHits.current = 0;
		await loadMore();
	}, [loadMore]);

	return { items, loadMore, loading, error, hasMore, refresh };
}
