"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type UserListItem = {
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  accent_color?: string | null;
  followStats?: {
    isFollowing: boolean;
    followers: number;
    following: number;
  };
};

export function useInfiniteUsers(initial?: { items: UserListItem[]; nextCursor: string | null }, pageSize = 24) {
  const [pages, setPages] = useState<{ items: UserListItem[]; nextCursor: string | null }[]>(
    initial ? [initial] : []
  );
  const [cursor, setCursor] = useState<string | null | "">(
    initial ? (initial.nextCursor ?? null) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const items = useMemo(() => {
    const map = new Map<string, UserListItem>();
    for (const p of pages) for (const it of p.items) map.set(it.user_id, it);
    return Array.from(map.values());
  }, [pages]);

  const loadMore = useCallback(async () => {
    if (inFlight.current || cursor === null) return;

    inFlight.current = true;
    setLoading(true);
    setError(null);

    try {
      const cursorParam = cursor === "" ? undefined : cursor;
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cursor: cursorParam, limit: pageSize }),
      });

      const res = await response.json();

      if ("error" in res && res.error) {
        setError(res.error);
      } else {
        setPages(prev => [...prev, { items: res.items ?? [], nextCursor: res.nextCursor ?? null }]);
        setCursor(res.nextCursor ?? null);
      }
    } catch {
      setError("Failed to load users");
    }

    setLoading(false);
    inFlight.current = false;
  }, [cursor, pageSize]);

  const hasMore = cursor !== null;

  useEffect(() => {
    // Only auto-load if we don't have initial data and cursor is empty
    if (cursor === "" && !inFlight.current && !initial) void loadMore();
  }, [cursor, loadMore, initial]);

  return { items, loadMore, loading, error, hasMore } as const;
}
