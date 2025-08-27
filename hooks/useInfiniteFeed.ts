"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PostRow } from "@/types";



export function useInfiniteFeed(initial?: { items: PostRow[]; nextCursor: string | null }, pageSize = 24, opts?: { authorId?: string }) {
  // If no initial page, start with an empty string cursor meaning "first page"
  const [pages, setPages] = useState<{ items: PostRow[]; nextCursor: string | null }[]>(
    initial ? [initial] : []
  );
  const [cursor, setCursor] = useState<string | null | "">(
    initial ? (initial.nextCursor ?? null) : "" // "" => load first page
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const items = useMemo(() => {
    const map = new Map<string, PostRow>();
    for (const p of pages) for (const it of p.items) map.set(it.id, it);
    return Array.from(map.values());
  }, [pages]);

  const loadMore = useCallback(async () => {
    if (inFlight.current || cursor === null) return; // null => no more pages
    inFlight.current = true;
    setLoading(true);
    setError(null);

    const cursorParam = cursor === "" ? undefined : cursor; // first page if ""
    const qs = new URLSearchParams();
    if (cursorParam) qs.set("cursor", cursorParam);
    qs.set("limit", String(pageSize));
    if (opts?.authorId) qs.set("userId", opts.authorId);
    const url = `/api/posts${qs.toString() ? `?${qs.toString()}` : ""}`;
    let res: { error?: string; items?: PostRow[]; nextCursor?: string | null } = {};
    try {
      const r = await fetch(url, { cache: "no-store" });
      res = await r.json();
      if (!r.ok) res = { error: res?.error || `status_${r.status}` };
    } catch (e: unknown) {
      console.log(e);
      res = { error: "network_error" };
    }

    if ("error" in res && res.error) {
      setError(res.error);
    } else {
      setPages(prev => [...prev, { items: res.items ?? [], nextCursor: res.nextCursor ?? null }]);
      setCursor(res.nextCursor ?? null);
    }

    setLoading(false);
    inFlight.current = false;
  }, [cursor, pageSize, opts?.authorId]);

  // hasMore: we still have more if cursor is "" (haven't loaded first page) or a non-null string
  const hasMore = cursor !== null;

  // auto-load first page on mount
  useEffect(() => {
    if (cursor === "" && !inFlight.current) {
      // fire and forget
      void loadMore();
    }
  }, [cursor, loadMore]);

  return { items, loadMore, loading, error, hasMore };
}
