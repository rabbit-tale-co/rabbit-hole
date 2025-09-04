"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { PremiumBadge } from "./PremiumBadge";
import { useInfiniteFollowers, type FollowerItem } from "@/hooks/useInfiniteFollowers";
import { useInfiniteFollowing, type FollowingItem } from "@/hooks/useInfiniteFollowing";
import { useFollow } from "@/hooks/useFollow";
import { useAuth } from "@/providers/AuthProvider";
import { generateAccentColor } from "@/lib/accent-colors";
import { buildPublicUrl } from "@/lib/publicUrl";
import { renderBioContent } from "@/lib/profile";

interface FollowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId: string;
  targetUsername: string;
  followersCount: number;
  followingCount: number;
}

/* -------------- Segmented tabs styling -------------- */

const tabsList =
  "grid w-full grid-cols-2 rounded-full bg-neutral-100 p-1";;

/* -------------- User item -------------- */

function UserListItem({
  user,
  showFollowButton = true,
}: {
  user: FollowerItem | FollowingItem;
  showFollowButton?: boolean;
}) {
  const { user: currentUser } = useAuth();
  const { loading: followLoading, isFollowing, toggleFollow } = useFollow(user.user_id);
  const accent = useMemo(() => generateAccentColor(user.username), [user.username]);

  const canFollow = Boolean(currentUser?.id) && currentUser!.id !== user.user_id;

  return (
    <li className="rounded-2xl bg-white border border-border hover:bg-neutral-50 transition overflow-hidden">
      <div className="flex items-start gap-3 p-3">
        <Link href={`/user/${user.username}`} className="flex-shrink-0 mt-0.5">
          <UserAvatar
            size="md"
            username={user.username}
            avatarUrl={user.avatar_url ? buildPublicUrl(user.avatar_url) : undefined}
            accentColor={accent}
            accentHex={user.accent_color || undefined}
            className="rounded-full ring-1 ring-black/5"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/user/${user.username}`} className="hover:underline">
              <span className="font-semibold text-neutral-950 truncate">
                {user.display_name || user.username}
              </span>
            </Link>
            <PremiumBadge show={Boolean(user.is_premium)} />
          </div>

          <Link
            href={`/user/${user.username}`}
            className="text-[13px] text-neutral-600 hover:underline"
          >
            @{user.username}
          </Link>

          {user.bio && (
            <div className="mt-1 text-[13px] text-neutral-700 leading-snug break-words line-clamp-2 pr-2">
              {renderBioContent(user.bio)}
            </div>
          )}
        </div>

        {showFollowButton && canFollow && (
          <div className="flex-shrink-0 self-center">
            <Button
              variant={isFollowing ? "secondary" : "default"}
              size="sm"
              disabled={followLoading}
              onClick={toggleFollow}
              aria-pressed={isFollowing}
              className="rounded-full"
            >

              {isFollowing ? (
                <span className="inline-flex items-center gap-1">
                  Following
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  Follow
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

/* -------------- Followers list -------------- */

function FollowersList({ targetUserId, targetUsername }: { targetUserId: string; targetUsername: string }) {
  const { items, loadMore, loading, error, hasMore } = useInfiniteFollowers(targetUserId);

  if (error) {
    return (
      <div className="p-8 text-center text-neutral-600">
        <p>Failed to load followers.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2 rounded-full">
          Try again
        </Button>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="p-12 text-center text-neutral-600">
        <p className="text-base font-medium">No followers yet</p>
        <p className="text-sm mt-1">When someone follows @{targetUsername}, they’ll appear here.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {items.map((u) => (
          <UserListItem key={u.user_id} user={u} showFollowButton />
        ))}
      </ul>

      <div className="relative">
        {/* gradient mask over list bottom */}
        {hasMore && <div className="pointer-events-none absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-white/0 to-white" />}
        <div className="p-4 pt-2">
          {hasMore && (
            <Button variant="outline" size="sm" onClick={loadMore} disabled={loading} className="w-full rounded-full">
              {loading ? "Loading…" : "Load more"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

/* -------------- Following list -------------- */

function FollowingList({ targetUserId, targetUsername }: { targetUserId: string; targetUsername: string }) {
  const { items, loadMore, loading, error, hasMore } = useInfiniteFollowing(targetUserId);

  if (error) {
    return (
      <div className="p-8 text-center text-neutral-600">
        <p>Failed to load following.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2 rounded-full">
          Try again
        </Button>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="p-12 text-center text-neutral-600">
        <p className="text-base font-medium">Not following anyone yet</p>
        <p className="text-sm mt-1">When @{targetUsername} follows someone, they’ll appear here.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {items.map((u) => (
          <UserListItem key={u.user_id} user={u} showFollowButton />
        ))}
      </ul>

      <div className="relative">
        {hasMore && <div className="pointer-events-none absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-white/0 to-white" />}
        <div className="p-4 pt-2">
          {hasMore && (
            <Button variant="outline" size="sm" onClick={loadMore} disabled={loading} className="w-full rounded-full">
              {loading ? "Loading…" : "Load more"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

/* -------------- Dialog -------------- */

export function FollowDialog({
  open,
  onOpenChange,
  targetUserId,
  targetUsername,
  followersCount,
  followingCount
}: FollowDialogProps) {
  const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[92vw] max-h-[80vh] flex flex-col overflow-hidden p-0 rounded-3xl">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-neutral-200 bg-white/80 backdrop-blur">
          <DialogTitle className="text-[15px] font-semibold">Followers</DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-3 pb-4">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "followers" | "following")}
            className="flex-1 flex flex-col"
          >
            <TabsList className={tabsList}>
              <TabsTrigger value="followers">
                Followers
                <span>
                  {followersCount.toLocaleString()}
                </span>
              </TabsTrigger>
              <TabsTrigger value="following">
                Following
                <span>
                  {followingCount.toLocaleString()}
                </span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 max-h-[56vh] overflow-y-auto pr-1">
              <TabsContent value="followers" className="m-0">
                <FollowersList targetUserId={targetUserId} targetUsername={targetUsername} />
              </TabsContent>
              <TabsContent value="following" className="m-0">
                <FollowingList targetUserId={targetUserId} targetUsername={targetUsername} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
