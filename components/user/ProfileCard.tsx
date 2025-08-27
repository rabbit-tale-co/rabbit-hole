"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { useRouter } from "next/navigation";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { generateAccentColor, getAccentColorStyle, getStyleFromHexShade, getAccentColorValue } from "@/lib/accent-colors";
import { cn } from "@/lib/utils";

type MiniUser = {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  accentColor?: string | null; // hex (preferred) else we’ll derive from username
  bio?: string | null;
  stats?: { followers?: number; following?: number; posts?: number };
};

type Props = {
  user: MiniUser;
  className?: string;
  size?: "sm" | "md"; // trigger size
  isFollowing?: boolean;
  pending?: boolean;
  onToggleFollow?: (next: boolean) => Promise<void> | void;
  insideLink?: boolean; // if rendered inside a clickable parent (e.g., Link), use button trigger to avoid nested <a>
};

export function UserChipHoverCard({
  user,
  className,
  size = "md",
  isFollowing = false,
  pending = false,
  onToggleFollow,
  insideLink = false,
}: Props) {
  const { username, displayName, avatarUrl, coverUrl, accentColor, bio, stats } = user;
  const accent500 =
    accentColor || getAccentColorValue(generateAccentColor(username), 500);
  const router = useRouter();

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent link navigation on button click
    if (pending || !onToggleFollow) return;
    await onToggleFollow(!isFollowing);
  };

  return (
    <HoverCard openDelay={120}>
      <HoverCardTrigger asChild>
        {insideLink ? (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/user/${username}`); }}
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
              <span className="block font-semibold truncate">
                {displayName?.trim() || username}
              </span>
              <span className="block text-[11px] opacity-70 truncate">@{username}</span>
            </span>
          </button>
        ) : (
          <Link
            href={`/user/${username}`}
            className={cn(
              "flex items-center gap-2 rounded-lg backdrop-blur-sm pr-3 pl-1 py-1",
              "bg-black/50",
              size === "sm" && "text-xs",
              size === "md" && "text-sm",
              className
            )}
          >
            <UserAvatar
              size={size === "sm" ? "sm" : "md"}
              username={username}
              avatarUrl={avatarUrl || undefined}
              className="rounded-md"
              accentHex={accent500}
            />
            <span className="leading-tight">
              <span className="block font-semibold truncate">
                {displayName?.trim() || username}
              </span>
              <span className="block text-[11px] opacity-70 truncate">@{username}</span>
            </span>
          </Link>
        )}
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
            <Image src={coverUrl} alt={`${username} cover`} fill className="object-cover" />
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
        <div className="p-4 pb-3">
          <div className="flex flex-col items-start gap-3">
            <Link href={`/user/${username}`}>
              <UserAvatar
                size={'xl'}
                username={username}
                avatarUrl={avatarUrl || undefined}
                className="-mt-12 ring-2 ring-white rounded-full"
                accentHex={accent500}
              />
            </Link>
            <div className="min-w-0 flex-1 flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <div className="font-semibold truncate">
                  <Link href={`/user/${username}`} className="hover:underline">
                    {displayName?.trim() || username}
                  </Link>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  <Link href={`/user/${username}`}>@{username}</Link>
                </div>
              </div>
              <Button
                variant={isFollowing ? "default" : "secondary"}
                onClick={handleFollow}
                disabled={pending}
                className="rounded-lg absolute right-3 mb-18"

              >
                {pending ? "…" : isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          </div>

          {/* bio */}
          {bio && bio.trim() && (
            <p className="mt-3 text-xs text-muted-foreground line-clamp-3">
              {bio}
            </p>
          )}

          {/* stats */}
          <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span><strong className="text-foreground">{stats?.followers ?? 0}</strong> Followers</span>
            <span>•</span>
            <span><strong className="text-foreground">{stats?.following ?? 0}</strong> Following</span>
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
