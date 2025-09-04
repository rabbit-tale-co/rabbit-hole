"use client";

import Link from "next/link";
import Image from "next/image";
import { buildPublicUrl } from "@/lib/publicUrl";
import * as React from "react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { generateAccentColor, getAccentColorStyle, getStyleFromHexShade, getAccentColorValue } from "@/lib/accent-colors";
import { cn } from "@/lib/utils";
import { PremiumBadge } from "./PremiumBadge";
import { useFollow } from "@/hooks/useFollow";

// FIXME: posts have different numbers for same user

type MiniUser = {
  user_id: string;
  username: string;
  displayName?: string | React.ReactNode | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  accentColor?: string | null; // hex (preferred) else we'll derive from username
  bio?: string | null;
  stats?: { posts?: number }; // Only posts count, followers/following from useFollow
  isPremium?: boolean;
};

type Props = {
  user: MiniUser;
  className?: string;
  size?: "sm" | "md"; // trigger size
  insideLink?: boolean; // if rendered inside a clickable parent (e.g., Link), use button trigger to avoid nested <a>
};

export function UserChipHoverCard({
  user,
  className,
  size = "md",
}: Props) {
  const { user_id, username, displayName, avatarUrl, coverUrl, accentColor, bio, stats } = user;
  const accent500 =
    accentColor || getAccentColorValue(generateAccentColor(username), 500);

  // Use the same follow hook as Profile component
  const { loading: followLoading, isFollowing, followers, following, canFollow, toggleFollow } =
    useFollow(user_id);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent link navigation on button click
    if (followLoading || !canFollow) return;
    toggleFollow();
  };

  return (
    <HoverCard openDelay={120}>
      <HoverCardTrigger asChild>
        <Link
          href={`/user/${username}`}
          className={cn(
            "flex items-center jus gap-2 rounded-lg backdrop-blur-sm pr-3 pl-1 py-1",
            "bg-black/50",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            className
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
              <span className="truncate">{typeof displayName === 'string' ? (String(displayName).trim() || username) : (displayName ?? username)}</span>
              <PremiumBadge show={Boolean((user as { isPremium?: boolean }).isPremium)} />
            </span>
            <span className="block text-[11px] opacity-70 truncate">@{username}</span>
          </span>
        </Link>
      </HoverCardTrigger>

      <HoverCardContent
        side="bottom"
        align="start"
        className={cn(
          "w-80 p-0 overflow-hidden",
          "bg-white ring-1 ring-[--border] rounded-2xl"
        )}
        onMouseDownCapture={(e) => {
          // allow clicks on internal links/buttons, but prevent dragging/selection from bubbling
          const target = e.target as HTMLElement;
          if (target.closest('a,button')) return; // let it through
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
              <Image src={buildPublicUrl(coverUrl)} alt={`${username} cover`} fill className="object-cover" unoptimized />
            )
          ) : (
            <div
              className="absolute inset-0"
              style={
                accentColor
                  ? getStyleFromHexShade(accentColor, "100", "backgroundColor")
                  : getAccentColorStyle(generateAccentColor(username), 100, "backgroundColor")
              }
            />
          )}
        </div>

        {/* header row */}
        <div className="p-4 pb-3 relative">
          <div className="flex flex-col items-start gap-3">
            <Link href={`/user/${username}`}>
              <UserAvatar
                size={'xl'}
                username={username}
                avatarUrl={avatarUrl ? buildPublicUrl(avatarUrl) : undefined}
                className="-mt-12 ring-2 ring-white rounded-full"
                accentHex={accent500}
              />
            </Link>
            <div className="min-w-0 flex-1 flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <div className="font-semibold truncate">
                  <Link href={`/user/${username}`} className="hover:underline">
                    {typeof displayName === 'string'
                      ? (<span className="truncate">{String(displayName).trim() || username}</span>)
                      : (displayName ?? <span className="truncate">{username}</span>)}
                  </Link>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  <Link href={`/user/${username}`}>@{username}</Link>
                </div>
              </div>
              <div className="flex-shrink-0 ml-2 absolute right-2 top-2">
                <Button
                  size="sm"
                  variant={isFollowing ? "secondary" : "default"}
                  onClick={handleFollow}
                  disabled={followLoading || !canFollow}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
            </div>
          </div>

          {/* bio */}
          {bio && bio.trim() && (
            <p className="mt-3 text-xs text-muted-foreground line-clamp-3">
              {bio}
            </p>
          )}

          {/* stats */}
          <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
            <span><strong className="text-foreground">{followers}</strong> Followers</span>
            <span>•</span>
            <span><strong className="text-foreground">{following}</strong> Following</span>
            {typeof stats?.posts === "number" && (
              <>
                <span>•</span>
                <span><strong className="text-foreground">{stats.posts}</strong> Posts</span>
              </>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard >
  );
}
