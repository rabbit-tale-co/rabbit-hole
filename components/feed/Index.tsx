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
import { UserAvatar } from "@/components/ui/user-avatar";
import { CalendarDays } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SocialActions } from "@/components/feed/interactions/social-actions";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import Link from "next/link";

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

  // quick lookup for overlays
  const idToPost = useMemo(() => {
    const m = new Map<string, typeof items[number]>();
    for (const p of items) m.set(p.id, p);
    return m;
  }, [items]);

  // lazy profile cache: author_id -> { username, avatar_url }
  const [authorProfiles, setAuthorProfiles] = useState<Map<string, { username?: string; display_name?: string; avatar_url?: string }>>(new Map());
  useEffect(() => {
    const missing = items
      .map((p) => p.author_id)
      .filter((id, i, arr) => arr.indexOf(id) === i)
      .filter((id) => !authorProfiles.has(id));
    if (missing.length === 0) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id,username,avatar_url,display_name")
        .in("user_id", missing as string[]);
      if (!data) return;
      setAuthorProfiles((prev) => {
        const next = new Map(prev);
        for (const row of data) next.set(row.user_id, { username: row.username, avatar_url: row.avatar_url, display_name: row.display_name });
        return next;
      });
    })();
  }, [items, authorProfiles]);


  // notify parent about count
  useEffect(() => {
    onCountChange?.(items.length);
  }, [items.length, onCountChange]);

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

              {/* overlays in BentoGallery style: top-left user, top-right date, bottom actions */}
              {(() => {
                const post = idToPost.get(p.tile.id);
                const profile = post ? authorProfiles.get(post.author_id) : undefined;
                const username = profile?.username;
                const displayName = profile?.display_name;
                const avatarUrl = profile?.avatar_url;
                const dateLabel = post?.created_at ? new Date(post.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "";
                return (
                  <>

                    {/* top-left user */}
                    {profile && (
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 text-white">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Link href={`/user/${username}`} className="flex items-center gap-2 bg-black/30 pr-3 py-1 pl-1 rounded-full backdrop-blur-sm">
                              <UserAvatar username={username!} avatarUrl={avatarUrl} className="ring-1 ring-white/20" />
                              <div className="flex flex-col leading-tight">
                                {displayName && <h4 className="text-xs sm:text-sm font-medium">{displayName}</h4>}
                                {username && <p className="text-[10px] sm:text-xs opacity-90">@{username}</p>}
                              </div>
                            </Link>
                          </HoverCardTrigger>
                          <HoverCardContent className="rounded-2xl">
                            <div className="flex items-start gap-3">
                              <UserAvatar username={username!} avatarUrl={avatarUrl} size="xl" />
                              <div className="min-w-0">
                                {displayName && <div className="font-semibold truncate">{displayName}</div>}
                                {username && <div className="text-sm text-muted-foreground truncate">@{username}</div>}
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    )}

                    {/* top-right date */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 text-white">
                      <div className="inline-flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm text-[10px] sm:text-xs">
                        <CalendarDays className="size-3.5 sm:size-4" />
                        <span>{dateLabel}</span>
                      </div>
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
