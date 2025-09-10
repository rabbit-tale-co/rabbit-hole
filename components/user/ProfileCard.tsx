"use client";

import Image from "next/image";
import Link from "next/link";
import type * as React from "react";
import { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useFollowLazy } from "@/hooks/useFollowLazy";
import {
  generateAccentColor,
  getAccentColorStyle,
  getAccentColorValue,
  getStyleFromHexShade,
} from "@/lib/accent-colors";
import { buildPublicUrl } from "@/lib/publicUrl";
import { cn } from "@/lib/utils";
import { FollowButton } from "./FollowButton";
import { PremiumBadge } from "./PremiumBadge";
import { Skeleton } from "../ui/skeleton";

type MiniUser = {
  user_id: string;
  username: string;
  displayName?: string | React.ReactNode | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  accentColor?: string | null;
  bio?: string | null;
  stats?: { posts?: number };
  isPremium?: boolean;
};

type Props = {
  user: MiniUser;
  className?: string;
  size?: "sm" | "md"; // trigger size
  insideLink?: boolean; // if rendered inside a clickable parent (e.g., Link), use button trigger to avoid nested <a>
};

export function UserChipHoverCard({ user, className, size = "md" }: Props) {
  const {
    user_id,
    username,
    displayName,
    avatarUrl,
    coverUrl,
    accentColor,
    bio,
    stats,
  } = user;
  const accent500 =
    accentColor || getAccentColorValue(generateAccentColor(username), 500);

  const [isHoverOpen, setIsHoverOpen] = useState(false);

  // Use lazy loading for follow stats - only load when hover card is open
  const {
    loading: followLoading,
    isFollowing,
    followers,
    following,
    canFollow,
    toggleFollow,
    loaded,
  } = useFollowLazy(user_id, isHoverOpen);

  const handleFollow = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // prevent link navigation on button click
    }
    if (followLoading || !canFollow) return;
    toggleFollow();
  };

  return (
    <HoverCard openDelay={120} onOpenChange={setIsHoverOpen}>
      <HoverCardTrigger asChild>
        <Link
          href={`/user/${username}`}
          className={cn(
            "flex items-center jus gap-2 rounded-lg backdrop-blur-sm pr-3 pl-1 py-1",
            "bg-black/50",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            className,
          )}
          aria-label={`Go to @${username}`}
        >
          <UserAvatar
            size={size === "sm" ? "sm" : "md"}
            username={username}
            avatarUrl={avatarUrl || undefined}
            className="rounded-md"
            accentHex={accent500}
          />
          <span className="flex flex-col items-start justify-center leading-tight">
            <span className="font-semibold flex items-center gap-1 min-w-0">
              <span className="truncate">
                {typeof displayName === "string"
                  ? String(displayName).trim() || username
                  : (displayName ?? username)}
              </span>
              <PremiumBadge
                show={Boolean((user as { isPremium?: boolean }).isPremium)}
              />
            </span>
            <span className="block text-[11px] opacity-70 truncate">
              @{username}
            </span>
          </span>
        </Link>
      </HoverCardTrigger>

      <HoverCardContent
        side="bottom"
        align="start"
        className={cn(
          "w-80 p-0 overflow-hidden",
          "bg-white dark:bg-black ring-1 ring-[--border] rounded-2xl",
        )}
        onMouseDownCapture={(e) => {
          // allow clicks on internal links/buttons, but prevent dragging/selection from bubbling
          const target = e.target as HTMLElement;
          if (target.closest("a,button")) return; // let it through
          e.stopPropagation();
        }}
      >
        {/* cover */}
        <div className="relative h-20 w-full overflow-hidden">
          {coverUrl ? (
            /\.webm(\?|#|$)/i.test(coverUrl) ? (
              <video
                key={coverUrl}
                src={buildPublicUrl(coverUrl)}
                className="absolute inset-0 size-full object-cover"
                muted
                playsInline
                autoPlay
                loop
              />
            ) : (
              <Image
                src={buildPublicUrl(coverUrl)}
                alt={`${username} cover`}
                fill
                className="object-cover"
                unoptimized
              />
            )
          ) : (
            <div
              className="absolute inset-0"
              style={
                accentColor
                  ? getStyleFromHexShade(accentColor, "100", "backgroundColor")
                  : getAccentColorStyle(
                    generateAccentColor(username),
                    100,
                    "backgroundColor",
                  )
              }
            />
          )}
        </div>

        {/* header row */}
        <div className="p-4 pb-3 relative">
          <div className="flex flex-col items-start gap-3">
            <Link href={`/user/${username}`}>
              <UserAvatar
                size={"xl"}
                username={username}
                avatarUrl={avatarUrl ? buildPublicUrl(avatarUrl) : undefined}
                className="-mt-12 ring-2 ring-white rounded-full"
                accentHex={accent500}
              />
            </Link>
            <div className="min-w-0 flex-1 flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <div className="font-semibold truncate flex items-center gap-1">
                  <Link href={`/user/${username}`} className="hover:underline">
                    {typeof displayName === "string" ? (
                      <span className="truncate">
                        {String(displayName).trim() || username}
                      </span>
                    ) : (
                      (displayName ?? (
                        <span className="truncate">{username}</span>
                      ))
                    )}
                  </Link>
                  <PremiumBadge
                    show={Boolean((user as { isPremium?: boolean }).isPremium)}
                  />
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  <Link href={`/user/${username}`}>@{username}</Link>
                </div>
              </div>
              <div className="flex-shrink-0 ml-2 absolute right-2 top-2">
                <FollowButton
                  isFollowing={isFollowing}
                  loading={followLoading}
                  canFollow={canFollow}
                  onToggle={handleFollow}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* bio */}
          {bio && bio.trim() && (
            <p className="mt-3 text-sm text-foreground line-clamp-3 leading-relaxed">
              {bio}
            </p>
          )}

          {/* stats */}
          <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
            {followLoading ? (
              <>
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-14" />
              </>
            ) : loaded ? (
              <>
                <span>
                  <strong className="text-foreground">{followers}</strong>{" "}
                  Followers
                </span>
                <span>•</span>
                <span>
                  <strong className="text-foreground">{following}</strong>{" "}
                  Following
                </span>
                {typeof stats?.posts === "number" && stats.posts > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      <strong className="text-foreground">{stats.posts}</strong>{" "}
                      Posts
                    </span>
                  </>
                )}
              </>
            ) : (
              <span>Hover to load stats</span>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
