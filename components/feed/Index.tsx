"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import { useBento } from "@/hooks/useBento";
import { bucketFromWH } from "@/lib/bento"; // or from your hooks if you moved it there
import type { Tile } from "@/types";
import { BentoSkeleton } from "@/components/feed/Loading"; // your skeleton
import ProfileEmptyGallery, { HomeEmptyFeed } from "@/components/feed/Empty";    // empty states
import { useIntersection } from "@/hooks/useIntersection"; // sentinel

export default function Feed({ initial, debugLoading, authorId, isOwnProfile, onCountChange }: { initial?: Parameters<typeof useInfiniteFeed>[0]; debugLoading?: boolean; authorId?: string; isOwnProfile?: boolean; onCountChange?: (n: number) => void }) {
  // data
  const { items, loadMore, loading, error, hasMore } = useInfiniteFeed(initial, 24, { authorId });

  const publicUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/social-art/${path}`);

  // map posts -> tiles (first image per post as cover)
  const tiles: Tile[] = useMemo(() => {
    return items
      .filter(p => p.images?.length > 0)
      .map(p => {
        const img = p.images[0];
        const bucket = bucketFromWH(img.width, img.height);
        return {
          id: p.id,
          w: bucket.w,
          h: bucket.h,
          cover: { path: img.path, width: img.width, height: img.height, alt: img.alt },
        } satisfies Tile;
      });
  }, [items]);

  // notify parent about count
  useEffect(() => {
    onCountChange?.(items.length);
  }, [items.length]);

  // packing
  const { cols, placed } = useBento(tiles);

  // container width (for pixel math)
  const rootRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const readWidth = () => {
      const w = el.getBoundingClientRect().width || el.clientWidth || 0;
      if (w > 0) setContainerW(w);
    };
    const raf = requestAnimationFrame(readWidth);
    const ro = new ResizeObserver(() => readWidth());
    ro.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  // sentinel to fetch next page
  const sentinelRef = useIntersection(() => {
    if (!loading && hasMore) loadMore();
  }, "1200px");

  // layout math
  const gap = 12;
  const cell = cols > 0 ? Math.floor((containerW - (cols - 1) * gap) / cols) : 0;
  const rows = placed.length ? Math.max(...placed.map((p) => p.y + p.h)) : 0;
  const containerHeight = rows > 0 ? rows * cell + (rows - 1) * gap : Math.max(cell, 240);

  // initial loading (no items yet) or container not measured
  const firstLoad = (items.length === 0 && loading) || debugLoading;

  if (firstLoad || cell <= 0) {
    return (
      <div ref={rootRef} className="w-full mt-6">
        <BentoSkeleton cols={cols} containerWidth={containerW} gap={gap} count={6} />
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return authorId ? <ProfileEmptyGallery isOwnProfile={!!isOwnProfile} /> : <HomeEmptyFeed />;
  }

  return (
    <div ref={rootRef} className="w-full mt-6">
      {/* loading indicator ABOVE posts while fetching more */}
      {loading && (

        <BentoSkeleton cols={cols} containerWidth={containerW} gap={gap} count={6} />

      )}

      <div className="relative" style={{ height: containerHeight, minHeight: Math.max(240, cell) }}>
        {placed.map((p) => {
          const top = p.y * (cell + gap);
          const left = p.x * (cell + gap);
          const width = Math.max(1, p.w * cell + (p.w - 1) * gap);
          const height = Math.max(1, p.h * cell + (p.h - 1) * gap);

          return (
            <article
              key={p.tile.id}
              className="absolute bg-neutral-100 ring-1 ring-[--border] rounded-2xl overflow-hidden"
              style={{ top, left, width, height, minWidth: 160, minHeight: 160 }}
            >
              <Image
                src={publicUrl(p.tile.cover.path)}
                alt={p.tile.cover.alt || ""}
                fill
                sizes={`${Math.ceil(width)}px`}
                className="object-cover"
                unoptimized
                priority={false}
              />
            </article>
          );
        })}
      </div>

      {/* sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-12" />

      {/* lightweight status */}
      {error && <div className="py-6 text-center text-sm text-red-600">Error: {error}</div>}
      {!hasMore && !loading && (
        <div className="py-8 text-center text-sm text-neutral-400">You’re all caught up.</div>
      )}
    </div>
  );
}
