"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { buildPublicUrl } from "@/lib/publicUrl";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import { useBento } from "@/hooks/useBento";
import { bucketFromWH } from "@/lib/bento";
import type { Tile } from "@/types";
import { BentoSkeleton } from "@/components/feed/Loading";
import ProfileEmptyGallery, { HomeEmptyFeed } from "@/components/feed/Empty";
import { useIntersection } from "@/hooks/useIntersection";
import { CalendarDays } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SocialActions } from "@/components/feed/interactions/social-actions";
import { Progress } from "@/components/ui/progress";
import { UserChipHoverCard } from "../user/ProfileCard";
import { PremiumBadge } from "../user/PremiumBadge";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { OutlineCalendar } from "../icons/Icons";

// Local hover slideshow for multi-image posts
function HoverSlideshow({ firstSrc, others, widthPx, alt }: { firstSrc: string; others: { src: string; alt?: string }[]; widthPx: number; alt?: string }) {
  const [hovered, setHovered] = useState(false);
  const [idx, setIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const imgs = [firstSrc, ...others.map(o => o.src)];
  const alts = [alt || "", ...others.map(o => o.alt || "")];
  const DURATION_MS = 1500;

  // progress-driven slideshow while hovered
  useEffect(() => {
    if (!hovered || imgs.length <= 1) { setPct(0); return; }
    let raf = 0;
    const start = performance.now();
    const loop = (t: number) => {
      const elapsed = t - start;
      const nextPct = Math.min(100, (elapsed / DURATION_MS) * 100);
      setPct(nextPct);
      if (nextPct >= 100) {
        setIdx((i) => (i + 1) % imgs.length);
      } else {
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // restart on index change
  }, [hovered, idx, imgs.length]);

  // reset when mouse leaves
  useEffect(() => {
    if (!hovered) { setIdx(0); setPct(0); }
  }, [hovered]);

  return (
    <div className="absolute inset-0" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {imgs.map((src, i) => (
        <Image
          key={i}
          src={src}
          alt={alts[i]}
          fill
          sizes={`${widthPx}px`}
          className={`object-cover transition-opacity duration-300 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
          unoptimized
          priority={false}
        />
      ))}
      {/* Darken image on parent article hover only */}
      <div className="pointer-events-none absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      {imgs.length > 1 && (
        <div className="absolute bottom-1 left-0 right-0 z-20 flex gap-1 px-6">
          {imgs.map((_, i) => (
            <Progress
              key={i}
              value={hovered ? (i < idx ? 100 : i === idx ? pct : 0) : 0}
              className="h-0.5 flex-1 bg-white/30 [&>div]:bg-white [&>div]:transition-none"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Feed({ initial, authorId, isOwnProfile, onCountChange }: { initial?: Parameters<typeof useInfiniteFeed>[0]; authorId?: string; isOwnProfile?: boolean; onCountChange?: (n: number) => void }) {
  // data
  const { items, loadMore, loading, error, hasMore } = useInfiniteFeed(initial, 24, { authorId });
  const router = useRouter();

  const publicUrl = (path: string) => buildPublicUrl(path);

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

  // quick lookup for overlays
  const idToPost = useMemo(() => {
    const m = new Map<string, typeof items[number]>();
    for (const p of items) m.set(p.id, p);
    return m;
  }, [items]);

  // lazy profile cache: author_id -> minimal profile
  const [authorProfiles, setAuthorProfiles] = useState<Map<string, { username: string; display_name: string; avatar_url: string; cover_url?: string; is_premium?: boolean }>>(new Map());
  useEffect(() => {
    const missing = items
      .map((p) => p.author_id)
      .filter((id, i, arr) => arr.indexOf(id) === i)
      .filter((id) => !authorProfiles.has(id));
    if (missing.length === 0) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id,username,avatar_url,cover_url,display_name,is_premium")
        .in("user_id", missing as string[]);
      if (!data) return;
      setAuthorProfiles((prev) => {
        const next = new Map(prev);
        for (const row of data) next.set(row.user_id, { username: row.username, avatar_url: row.avatar_url, cover_url: row.cover_url, display_name: row.display_name, is_premium: (row as { is_premium?: boolean }).is_premium });
        return next;
      });
    })();
  }, [items, authorProfiles]);


  // notify parent about count
  useEffect(() => {
    onCountChange?.(items.length);
  }, [items.length, onCountChange]);

  // Hover slideshow is implemented per-tile; no modal viewer state needed

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
  const firstLoad = (items.length === 0 && loading);

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
      {/* hover slideshow handled within tiles; click-through to post page */}

      <div className="relative" style={{ height: containerHeight, minHeight: Math.max(240, cell) }}>
        {placed.map((p) => {
          const top = p.y * (cell + gap);
          const left = p.x * (cell + gap);
          const width = Math.max(1, p.w * cell + (p.w - 1) * gap);
          const height = Math.max(1, p.h * cell + (p.h - 1) * gap);

          return (
            <article
              key={p.tile.id}
              onClick={() => { router.push(`/post/${p.tile.id}`); }}
              className="group absolute bg-neutral-100 rounded-2xl overflow-hidden cursor-pointer"
              style={{ top, left, width, height, minWidth: 160, minHeight: 160 }}
            >
              {(() => {
                const post = idToPost.get(p.tile.id);
                const medias = post?.images || [];
                const first = medias[0];
                if (!first) return null;
                const firstUrl = publicUrl(first.path || "");
                const isVideo = String(first.mime || '').startsWith('video/');
                if (isVideo) {
                  return (
                    <div className="absolute inset-0">
                      <video
                        src={firstUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    </div>
                  );
                }
                // First is image: build slideshow only from image assets (skip videos to avoid Next/Image errors)
                const restImageMedias = medias
                  .slice(1)
                  .filter(im => !String((im as { mime?: string }).mime || '').startsWith('video/'));
                return (
                  <HoverSlideshow
                    firstSrc={firstUrl || ""}
                    others={restImageMedias.map(im => ({ src: publicUrl(im.path || ""), alt: im.alt || '' }))}
                    widthPx={Math.ceil(width)}
                    alt={p.tile.cover.alt || ''}
                  />
                );
              })()}

              {/* overlays in BentoGallery style: top-left user, top-right date, bottom actions */}
              {(() => {
                const post = idToPost.get(p.tile.id);
                const profile = post ? authorProfiles.get(post.author_id) : undefined;
                const dateLabel = post?.created_at ? new Date(post.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "";
                return (
                  <>

                    {/* top-left user */}
                    {profile && !authorId && (
                      <div
                        className="absolute top-2 left-2 sm:top-3 sm:left-3 z-30 text-white"
                        onClick={(e) => { e.stopPropagation(); }}
                      >
                        <UserChipHoverCard user={{
                          username: profile.username,
                          avatarUrl: profile.avatar_url,
                          displayName: (
                            <span className="inline-flex items-center gap-1">
                              <span className="truncate">{profile.display_name}</span>
                              <PremiumBadge show={Boolean(profile.is_premium)} />
                            </span>
                          ),
                          coverUrl: profile.cover_url ? publicUrl(profile.cover_url) : undefined,
                          stats: {
                            followers: post?.like_count ?? 0,
                            following: post?.comment_count ?? 0,
                          }
                        }} size={'sm'} insideLink />
                      </div>
                    )}

                    {/* top-right date with tooltip */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 text-white">
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className="bg-black/50">
                              <OutlineCalendar />
                              {dateLabel}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" align="center" className="text-xs">
                            {post?.created_at ? new Date(post.created_at).toLocaleString() : ""}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {/* bottom gradient + actions row */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3">
                      <SocialActions
                        likes={post?.like_count ?? 0}
                        comments={post?.comment_count ?? 0}
                        reposts={post?.repost_count ?? 0}
                        bookmarks={post?.bookmark_count ?? 0}
                        isLiked={false}
                        isReposted={false}
                        isBookmarked={false}
                        showBookmarksCount={false}
                        onLike={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onComment={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onRepost={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onBookmark={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      />
                    </div>
                  </>
                );
              })()}
            </article>
          );
        })}
      </div>

      {/* sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-12" />

      {/* lightweight status */}
      {error && <div className="py-6 text-center text-sm text-red-600">Error: {error}</div>}
      {
        !hasMore && !loading && (
          <div className="py-8 text-center text-sm text-neutral-400">You’re all caught up.</div>
        )
      }
    </div >
  );
}
