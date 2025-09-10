"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteFeed } from "./useInfiniteFeed";
import { useBento } from "./useBento";
import { useIntersection } from "./useIntersection";
import { useManualImpression } from "./useManualImpression";
import { useAuthorProfiles } from "./useUser";
import { useContainerWidth } from "./useUI";
import { bucketFromWH } from "@/lib/bento";
import { buildPublicUrl } from "@/lib/publicUrl";
import type { Tile, PostRow } from "@/types";

export function useFeed(
  initial?: Parameters<typeof useInfiniteFeed>[0],
  username?: string,
  isOwnProfile?: boolean,
  onCountChange?: (n: number) => void,
  forceUpdate?: number
) {
  const router = useRouter();
  const { recordImpression } = useManualImpression({ enabled: false });

  // Data fetching
  const { items, loadMore, loading, error, hasMore } = useInfiniteFeed(
    initial,
    24,
    { username }
  );

  // Map posts to tiles (first image per post as cover)
  const tiles: Tile[] = useMemo(() => {
    const postsWithImages = items.filter((p) => p.images?.length > 0);

    return postsWithImages.map((p) => {
      const img = p.images[0];
      const bucket = bucketFromWH(img.width, img.height);
      return {
        id: p.id,
        w: bucket.w,
        h: bucket.h,
        cover: {
          path: img.path,
          width: img.width,
          height: img.height,
          alt: img.alt,
        },
      } satisfies Tile;
    });
  }, [items]);

  // Quick lookup for overlays
  const idToPost = useMemo(() => {
    const m = new Map<string, (typeof items)[number]>();
    for (const p of items) m.set(p.id, p);
    return m;
  }, [items]);

  // Author profiles caching
  const authorIds = useMemo(() => {
    return items
      .map((p) => p.author_id)
      .filter((id, i, arr) => arr.indexOf(id) === i);
  }, [items]);

  const { authorProfiles } = useAuthorProfiles(authorIds);

  // Container width tracking
  const { containerWidth, rootRef, isTransitioning } = useContainerWidth(forceUpdate);

  // Force bento update when container width changes
  const [bentoForceUpdate, setBentoForceUpdate] = useState(0);
  useEffect(() => {
    if (containerWidth > 0) {
      setBentoForceUpdate(Date.now());
    }
  }, [containerWidth]);

  // Bento layout - use container width for responsive column calculation
  const { cols, placed } = useBento(tiles, bentoForceUpdate);

  // Intersection observer for infinite scroll
  const sentinelRef = useIntersection(
    () => {
      if (!loading && hasMore) loadMore();
    },
    {
      rootMargin: "1200px 0px 800px 0px", // prefetch ~1 screen earlier
      threshold: 0,
      disabled: loading || !hasMore,
      debounceMs: 80,
    }
  );

  // Layout math
  const gap = 12;
  const MAX_W_PX = 56 * 16; // 56rem w px = 896
  const effectiveW = Math.min(containerWidth, MAX_W_PX);
  const cell = cols > 0 ? Math.floor((effectiveW - (cols - 1) * gap) / cols) : 0;
  const rows = placed.length ? Math.max(...placed.map((p) => p.y + p.h)) : 0;
  const containerHeight =
    rows > 0 ? rows * cell + (rows - 1) * gap : Math.max(cell, 240);

  // Animation state
  const feedReady = !loading && items.length > 0 && cell > 0;
  const [animateGate, setAnimateGate] = useState(false);

  useEffect(() => {
    if (!feedReady) {
      setAnimateGate(false);
      return;
    }
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => setAnimateGate(true));
      (setAnimateGate as { _id2?: number })._id2 = id2;
    });
    return () => {
      cancelAnimationFrame(id1);
      const id2 = (setAnimateGate as { _id2?: number })._id2;
      if (id2) cancelAnimationFrame(id2);
    };
  }, [feedReady]);

  // Notify parent about count
  useEffect(() => {
    onCountChange?.(items.length);
  }, [items.length, onCountChange]);

  // Post click handler
  const handlePostClick = useCallback(
    async (postId: string) => {
      await recordImpression(postId);
      router.push(`/post/${postId}`);
    },
    [recordImpression, router]
  );

  // Public URL helper
  const publicUrl = useCallback((path: string) => buildPublicUrl(path), []);

  return {
    // Data
    items,
    tiles,
    idToPost,
    authorProfiles,

    // Layout
    cols,
    placed,
    containerWidth,
    containerHeight,
    cell,
    gap,

    // State
    loading,
    error,
    hasMore,
    feedReady,
    animateGate,
    isTransitioning,

    // Refs
    rootRef,
    sentinelRef,

    // Actions
    loadMore,
    handlePostClick,
    publicUrl,
  };
}
