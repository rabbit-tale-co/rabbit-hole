"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getUsersPage } from "@/app/actions/profile";

export type UserListItem = {
  user_id: string;
  username: string;
  display_name?: string;
  bio?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  accent_color?: string | null;
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

    const cursorParam = cursor === "" ? undefined : cursor;
    const res = await getUsersPage({ cursor: cursorParam, limit: pageSize });
    if ("error" in res && res.error) {
      setError(res.error);
    } else {
      setPages(prev => [...prev, { items: res.items ?? [], nextCursor: res.nextCursor ?? null }]);
      setCursor(res.nextCursor ?? null);
    }

    setLoading(false);
    inFlight.current = false;
  }, [cursor, pageSize]);

  const hasMore = cursor !== null;

  useEffect(() => {
    if (cursor === "" && !inFlight.current) void loadMore();
  }, [cursor, loadMore]);

  return { items, loadMore, loading, error, hasMore } as const;
}
