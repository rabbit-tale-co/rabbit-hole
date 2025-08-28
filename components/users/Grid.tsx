"use client";

import Link from "next/link";
import Image from "next/image";
import { useInfiniteUsers } from "@/hooks/useInfiniteUsers";
import { useIntersection } from "@/hooks/useIntersection";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  generateAccentColor,
  getAccentColorStyle,
  getAccentColorValue,
  getStyleFromHexShade,
} from "@/lib/accent-colors";
import { renderBioContent } from "@/lib/profile";

/** Minimal card with bg-white, ring-1, rounded, no shadows. */
function UserCard({ user: u }: {
  user: {
    user_id: string; username: string; display_name: string | null;
    avatar_url: string | null; cover_url: string | null; accent_color: string | null; bio?: string | null;
  }
}) {
  const avatarAccentHex =
    u.accent_color || getAccentColorValue(generateAccentColor(u.username), 500);

  return (
    <Link href={`/user/${u.username}`}>
      <article
        className="group h-[300px] sm:h-[300px] lg:h-[300px] ring-1 ring-border flex flex-col rounded-2xl bg-white transition-transform hover:scale-105 duration-150"
      >
        {/* cover: fixed height */}
        <div className="relative h-24 sm:h-30 w-full overflow-hidden rounded-t-2xl">
          {u.cover_url ? (
            <Image
              src={u.cover_url}
              alt={`${u.username} cover`}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={
                u.accent_color
                  ? getStyleFromHexShade(u.accent_color, "100", "backgroundColor")
                  : getAccentColorStyle(generateAccentColor(u.username), 100, "backgroundColor")
              }
              aria-hidden
            />
          )}
        </div>

        {/* content area grows */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="-mt-11">
            <UserAvatar
              className="ring-2 ring-white size-14"
              username={u.username}
              avatarUrl={u.avatar_url || undefined}
              accentHex={avatarAccentHex}
            />
          </div>

          <div className="mt-2 min-w-0">
            <h3 className="text-sm font-semibold truncate">
              {u.display_name?.trim() || u.username}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground truncate">@{u.username}</p>
          </div>

          {/* bio block keeps consistent vertical space */}
          {u.bio && u.bio.trim() ? (
            <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {renderBioContent(u.bio)}
            </div>
          ) : (
            // reserve roughly the space of 2 lines to keep cards equal visually
            <div className="mt-2 h-[1.75rem]" aria-hidden />
          )}

          {/* footer pinned to bottom */}
          <div className="mt-auto pt-3 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Followers 0 • Following 0</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function UsersGrid() {
  const { items, loadMore, loading, error, hasMore } = useInfiniteUsers(undefined, 36);
  const sentinelRef = useIntersection(() => { if (!loading && hasMore) loadMore(); }, "900px");

  const isEmpty = !loading && items.length === 0;

  return (
    <section className="w-full">
      <div className="flex items-end justify-between mt-6">
        <h2 className="text-sm font-semibold">Creators</h2>
        <span className="text-xs text-muted-foreground">{items.length} found</span>
      </div>

      {isEmpty ? (
        <div className="mt-8 rounded-2xl bg-white ring-1 ring-[--border] p-10 text-center">
          <p className="text-sm font-medium">No users yet</p>
          <p className="mt-1 text-xs text-muted-foreground">When new artists join, they’ll show up here.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((u) => (
            <UserCard key={u.user_id} user={{
              user_id: u.user_id,
              username: u.username,
              display_name: u.display_name ?? null,
              avatar_url: u.avatar_url ?? null,
              cover_url: u.cover_url ?? null,
              accent_color: u.accent_color ?? null,
              bio: (u as { bio?: string | null }).bio ?? null,
            }} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-10" />
      {loading && <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="py-6 text-center text-sm text-red-600">{error}</div>}
      {!hasMore && !loading && items.length > 0 && (
        <div className="py-8 text-center text-xs text-neutral-400">You’re all caught up.</div>
      )}
    </section>
  );
}
