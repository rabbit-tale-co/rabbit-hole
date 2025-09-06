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
    if (inFlight.current || globalInFlight || cursorRef.current === null || !mounted.current) {
      console.log("useInfiniteFeed: loadMore skipped - inFlight:", inFlight.current, "globalInFlight:", globalInFlight, "cursor:", cursorRef.current, "mounted:", mounted.current);
      return;
    }

    inFlight.current = true;
    globalInFlight = true;
    setLoading(true);
    setError(null);
    console.log("useInfiniteFeed: Starting loadMore, setting loading=true");

    const currentCursor = cursorRef.current;
    const cursorParam = currentCursor === "" ? undefined : currentCursor;

    const qs = new URLSearchParams();
    if (cursorParam) qs.set("cursor", cursorParam);
    qs.set("limit", String(pageSize));
    if (opts?.authorId) qs.set("userId", opts.authorId);
    const url = `/api/posts${qs.toString() ? `?${qs.toString()}` : ""}`;

    abortRef.current?.abort();
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

      if (!mounted.current) return;

      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body?.error || `status_${r.status}`);
      }

       const res = (await r.json()) as { items?: PostRow[]; nextCursor?: string | null };

       const next = ("nextCursor" in res ? res.nextCursor : null) ?? null;

       if (next && next === currentCursor) {
         sameTokenHits.current += 1;   // powtarza się token
       } else {
         sameTokenHits.current = 0;
       }

       // – uznaj koniec TYLKO gdy backend jasno mówi null/undefined
       //   ALBO dostaliśmy ten sam token np. 3 razy z rzędu
       //   ALBO backend zwrócił mniej elementów niż pageSize (ostatnia strona)
       const itemsCount = res.items?.length ?? 0;
       const reachedEnd = next === null || sameTokenHits.current >= 3 || itemsCount < pageSize;
       const finalNext = reachedEnd ? null : next;

       setPages(prev => [...prev, { items: res.items ?? [], nextCursor: finalNext }]);
       setCursor(finalNext);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
        console.log("useInfiniteFeed: Finished loadMore, setting loading=false");
      }
      inFlight.current = false;
      globalInFlight = false;
    }
  }, [pageSize, opts?.authorId]);

  const hasMore = cursor !== null;

  // auto-load pierwszej strony przy montowaniu (gdy nie ma initial)
  useEffect(() => {
    if (!hasAutoLoaded.current && cursor === "") {
      hasAutoLoaded.current = true;
      void loadMore();
    }
  }, [cursor, loadMore]); // Remove loadMore from dependencies

  // reset przy zmianie filtra (np. authorId) lub pageSize
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

  // opcjonalnie: ręczne odświeżenie
  const refresh = useCallback(async () => {
    setPages([]);
    setCursor("");
    hasAutoLoaded.current = false;
    sameTokenHits.current = 0; // reset licznika przy odświeżeniu
    await loadMore();
  }, [loadMore]);

  return { items, loadMore, loading, error, hasMore, refresh };
}
