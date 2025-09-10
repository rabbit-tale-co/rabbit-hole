"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/ui/user-avatar";
import { FollowButton } from "@/components/user/FollowButton";
import { useFollow } from "@/hooks/useFollow";
import { useGlobalFollowStats } from "@/hooks/useGlobalFollowStats";
import { type UserListItem, useInfiniteUsers } from "@/hooks/useInfiniteUsers";
import { useIntersection } from "@/hooks/useIntersection";
import { useUsersCount } from "@/hooks/useUsersCount";
import {
  generateAccentColor,
  getAccentColorStyle,
  getAccentColorValue,
  getStyleFromHexShade,
} from "@/lib/accent-colors";
import { renderBioContent } from "@/lib/profile";
import { buildPublicUrl } from "@/lib/publicUrl";
import type { User } from "@/types/user";
import { SolidCarrot } from "../icons/Icons";

/** Minimal card with bg-white, ring-1, rounded, no shadows. */
function UserCard({
  user: u,
}: {
  user: User & {
    banned_until?: string | null;
  };
}) {
  const avatarAccentHex =
    u.accent_color || getAccentColorValue(generateAccentColor(u.user_id), 500);
  const isSuspended = Boolean(
    u.banned_until && Date.parse(u.banned_until) > Date.now(),
  );
  const isOwnProfile = false; // Cannot determine ownership without user_id

  // Use follow stats from the user data (counts) and update follow status client-side
  const { followStats: clientFollowStats, loading: followStatsLoading } =
    useGlobalFollowStats(u.username);
  const serverFollowStats = u.followStats;

  // Merge server stats (counts) with client stats (follow status)
  const followStats = serverFollowStats
    ? {
      ...serverFollowStats,
      isFollowing:
        clientFollowStats?.isFollowing ?? serverFollowStats?.isFollowing,
    }
    : clientFollowStats;

  const { loading: followLoading, toggleFollow } = useFollow(
    u.username,
    followStats || { isFollowing: false, followers: 0, following: 0 },
  );

  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/user/${u.username}`);
  };

  return (
    <article
      className="group h-[280px] sm:h-[300px] lg:h-[320px] ring-1 ring-border flex flex-col rounded-2xl bg-white hover:bg-neutral-50 transition-colors duration-150 cursor-pointer text-left"
      data-username={u.username}
      onClick={handleCardClick}
      aria-label={`View ${u.display_name || u.username}'s profile`}
    >
      {/* cover: fixed height */}
      <div className="relative h-24 sm:h-30 w-full overflow-hidden rounded-t-2xl">
        {u.banned_until && Date.parse(u.banned_until) > Date.now() && (
          <div className="absolute inset-0 z-10 flex items-start justify-end p-2">
            <span className="rounded-full bg-red-600/90 text-white text-[10px] px-2 py-1">
              Suspended
            </span>
          </div>
        )}
        {!isSuspended && u.cover_url ? (
          /\.webm(\?|#|$)/i.test(u.cover_url) ? (
            <video
              key={u.cover_url}
              src={buildPublicUrl(u.cover_url)}
              className="absolute inset-0 size-full object-cover"
              muted
              playsInline
              autoPlay
              loop
            />
          ) : (
            <Image
              src={buildPublicUrl(u.cover_url)}
              alt={`${u.username} cover`}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              quality={100}
            />
          )
        ) : (
          <div
            className="absolute inset-0"
            style={
              u.accent_color
                ? getStyleFromHexShade(u.accent_color, "100", "backgroundColor")
                : getAccentColorStyle(
                  generateAccentColor(u.user_id),
                  100,
                  "backgroundColor",
                )
            }
            aria-hidden
          />
        )}
      </div>

      {/* content area grows */}
      <div className="p-4 flex-1 flex flex-col relative">
        <div className="-mt-10">
          <UserAvatar
            className="ring-2 ring-white"
            size="lg"
            username={u.username}
            avatarUrl={
              !isSuspended && u.avatar_url
                ? buildPublicUrl(u.avatar_url)
                : undefined
            }
            accentHex={avatarAccentHex}
          />
          {followStats && !isSuspended && !isOwnProfile && (
            <div className="absolute right-2 top-2">
              <FollowButton
                isFollowing={followStats.isFollowing}
                loading={followLoading}
                canFollow={true}
                onToggle={toggleFollow}
                size="sm"
              />
            </div>
          )}
        </div>

        <div className="mt-2 min-w-0">
          <h3 className="text-sm font-semibold">
            <span className="flex items-center gap-1 min-w-0">
              <span className="truncate">
                {u.display_name?.trim() || u.username}
              </span>
              {u.is_premium && <SolidCarrot className="size-4 shrink-0" />}
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            @{u.username}
          </p>
        </div>

        {/* bio block keeps consistent vertical space */}
        {u.bio?.trim() ? (
          <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
            {renderBioContent(u.bio)}
          </div>
        ) : (
          // reserve roughly the space of 2 lines to keep cards equal visually
          <div className="mt-2 h-[1.75rem]" aria-hidden />
        )}

        {/* footer pinned to bottom */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {followStatsLoading
              ? "Loading..."
              : followStats
                ? `${followStats.followers} Followers • ${followStats.following} Following`
                : "0 Followers • 0 Following"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function UsersGrid({
  initialData,
}: {
  initialData?: { items: UserListItem[]; nextCursor: string | null };
}) {
  const { items, loadMore, loading, error, hasMore } = useInfiniteUsers(
    initialData,
    20,
  );
  const { count: totalUsersCount, loading: countLoading } = useUsersCount();
  const sentinelRef = useIntersection(
    () => {
      if (!loading && hasMore) loadMore();
    },
    {
      rootMargin: "900px 0px 600px 0px",
      threshold: 0,
      disabled: loading || !hasMore,
      debounceMs: 80,
    },
  );

  const isEmpty = !loading && items.length === 0;

  return (
    <section className="w-full">
      <div className="flex items-end justify-between mt-6">
        <h2 className="text-sm font-semibold">Creators</h2>
        <span className="text-xs text-muted-foreground">
          {countLoading ? "..." : totalUsersCount !== null ? `${totalUsersCount} total` : `${items.length} found`}
        </span>
      </div>

      {isEmpty ? (
        <div className="mt-8 rounded-2xl bg-white ring-1 ring-[--border] p-10 text-center">
          <p className="text-sm font-medium">No users yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            When new artists join, they'll show up here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((u) => (
            <UserCard
              key={u.username}
              user={{
                user_id: u.user_id,
                username: u.username,
                display_name: u.display_name ?? null,
                avatar_url: u.avatar_url ?? null,
                cover_url: u.cover_url ?? null,
                accent_color: u.accent_color ?? null,
                bio: (u as { bio?: string | null }).bio ?? null,
                is_premium: (u as { is_premium?: boolean }).is_premium ?? false,
                banned_until:
                  (u as { banned_until?: string | null }).banned_until ?? null,
                followStats: (
                  u as {
                    followStats?: {
                      isFollowing: boolean;
                      followers: number;
                      following: number;
                    };
                  }
                ).followStats,
              }}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-10" />
      {loading && (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      )}
      {error && (
        <div className="py-6 text-center text-sm text-red-600">{error}</div>
      )}
      {!hasMore && !loading && items.length > 0 && (
        <div className="py-8 text-center text-xs text-neutral-400">
          You’re all caught up.
        </div>
      )}
    </section>
  );
}
