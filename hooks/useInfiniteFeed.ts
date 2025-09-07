"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PostRow } from "@/types";
import { supabase } from "@/lib/supabase";

// Global flag to prevent multiple simultaneous requests
let globalInFlight = false;

type Page = { items: PostRow[]; nextCursor: string | null };

export function useInfiniteFeed(
  initial?: Page,
  pageSize = 24,
  opts?: { authorId?: string }
) {
  // ""  -> trzeba pobrać pierwszą stronę
  // null -> nie ma już więcej stron
  const [pages, setPages] = useState<Page[]>(initial ? [initial] : []);
  const [cursor, setCursor] = useState<string | null | "">(
    initial ? initial.nextCursor ?? null : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // strażnicy
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const hasAutoLoaded = useRef(!!initial);
  const cursorRef = useRef(cursor);
  const abortRef = useRef<AbortController | null>(null);
  const sameTokenHits = useRef(0);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Feed refresh event received - resetting feed');
      setPages([]);
      setCursor("");
      setError(null);
      hasAutoLoaded.current = false;
      console.log('Feed reset complete');
    };

    window.addEventListener('feed-refresh', handleRefresh);
    return () => window.removeEventListener('feed-refresh', handleRefresh);
  }, []);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  // złączenie stron + deduplikacja po id
  const items = useMemo(() => {
    const map = new Map<string, PostRow>();
    for (const p of pages) for (const it of p.items) map.set(it.id, it);
    return Array.from(map.values());
  }, [pages]);

  const loadMore = useCallback(async () => {
    const loadId = Math.random().toString(36).substring(7);
    console.log(`[${loadId}] loadMore called:`, {
      inFlight: inFlight.current,
      globalInFlight,
      cursor: cursorRef.current,
      mounted: mounted.current
    });

    if (inFlight.current || globalInFlight || cursorRef.current === null || !mounted.current) {
      console.log(`[${loadId}] loadMore early return`);
      return;
    }

    // Sprawdź czy komponent jest nadal zamontowany przed rozpoczęciem
    if (!mounted.current) {
      return;
    }

    inFlight.current = true;
    globalInFlight = true;
    setLoading(true);
    setError(null);

    const currentCursor = cursorRef.current;
    const cursorParam = currentCursor === "" ? undefined : currentCursor;

    const qs = new URLSearchParams();
    if (cursorParam) qs.set("cursor", cursorParam);
    qs.set("limit", String(pageSize));
    if (opts?.authorId) qs.set("userId", opts.authorId);
    const url = `/api/posts${qs.toString() ? `?${qs.toString()}` : ""}`;

    // Anuluj poprzednie żądanie tylko jeśli istnieje
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const r = await fetch(url, {
        cache: "no-store",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        signal: ac.signal,
      });

      if (!mounted.current) {
        return;
      }

      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body?.error || `status_${r.status}`);
      }

       const res = (await r.json()) as { items?: PostRow[]; nextCursor?: string | null };

       const next = ("nextCursor" in res ? res.nextCursor : null) ?? null;

       if (next && next === currentCursor) {
         sameTokenHits.current += 1;
       } else {
         sameTokenHits.current = 0;
       }

       const itemsCount = res.items?.length ?? 0;
       const reachedEnd = next === null || sameTokenHits.current >= 3 || itemsCount < pageSize;
       const finalNext = reachedEnd ? null : next;

       if (!mounted.current) {
         return;
       }

       setPages(prev => [...prev, { items: res.items ?? [], nextCursor: finalNext }]);
       setCursor(finalNext);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
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
    } finally {
      console.log(`[${loadId}] loadMore completed`);
      if (mounted.current) {
        setLoading(false);
      }
      inFlight.current = false;
      globalInFlight = false;
    }
  }, [pageSize, opts?.authorId]);

  const hasMore = cursor !== null;

  useEffect(() => {
    console.log('Auto-load useEffect triggered:', {
      hasAutoLoaded: hasAutoLoaded.current,
      cursor,
      mounted: mounted.current
    });
    if (!hasAutoLoaded.current && cursor === "" && mounted.current) {
      console.log('Auto-loading feed...');
      hasAutoLoaded.current = true;
      setTimeout(() => {
        if (mounted.current) {
          console.log('Calling loadMore from auto-load useEffect');
          void loadMore();
        }
      }, 100);
    }
  }, [cursor, loadMore]);

  useEffect(() => {
    setPages(initial ? [initial] : []);
    setCursor(initial ? initial.nextCursor ?? null : "");
    hasAutoLoaded.current = !!initial;
    sameTokenHits.current = 0; // reset licznika powtarzających się tokenów
  }, [opts?.authorId, pageSize, initial]);

  // sprzątanie
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abortRef.current?.abort();
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
