import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FollowDialog } from "./FollowDialog";
import { PremiumBadge } from "@/components/premium/PremiumFeature";

interface ProfileStatsProps {
  posts: number;
  following: number;
  followers: number;
  targetUserId?: string;
  targetUsername?: string;
  showPremiumBadge?: boolean;
  onClickPosts?: () => void;
  onClickFollowing?: () => void;
  onClickFollowers?: () => void;
}

export function ProfileStats({
  posts,
  following,
  followers,
  targetUserId,
  targetUsername,
  showPremiumBadge = false,
  onClickPosts,
  onClickFollowing,
  onClickFollowers
}: ProfileStatsProps) {
  const [followDialogOpen, setFollowDialogOpen] = useState(false);

  const handleFollowersClick = () => {
    if (onClickFollowers) {
      onClickFollowers();
    } else if (targetUserId && targetUsername) {
      setFollowDialogOpen(true);
    }
  };

  const handleFollowingClick = () => {
    if (onClickFollowing) {
      onClickFollowing();
    } else if (targetUserId && targetUsername) {
      setFollowDialogOpen(true);
    }
  };

  return (
    <>
      <div className="flex justify-center h-8 items-center space-x-1 tabular-nums">
        <Button
          variant="ghost"
          size="sm"
          className="font-mono"
          onClick={onClickPosts}
        >
          <h4 className="font-semibold text-neutral-950 mr-0.5" data-profile-posts-count>{posts.toLocaleString()}</h4>
          <span className="text-neutral-500">Posts</span>
        </Button>
        <Separator orientation="vertical" className="!h-4" />
        <Button
          variant="ghost"
          size="sm"
          className="font-mono"
          onClick={handleFollowingClick}
        >
          <h4 className="font-semibold text-neutral-950 mr-0.5">{following.toLocaleString()}</h4>
          <span className="text-neutral-500">Following</span>
        </Button>
        <Separator orientation="vertical" className="!h-4" />
        <Button
          variant="ghost"
          size="sm"
          className="font-mono"
          onClick={handleFollowersClick}
        >
          <h4 className="font-semibold text-neutral-950 mr-0.5">{followers.toLocaleString()}</h4>
          <span className="text-neutral-500">Followers</span>
        </Button>
      </div>

      {showPremiumBadge && (
        <div className="flex justify-center mt-2">
          <PremiumBadge />
        </div>
      )}

      {targetUserId && targetUsername && (
        <FollowDialog
          open={followDialogOpen}
          onOpenChange={setFollowDialogOpen}
          targetUserId={targetUserId}
          targetUsername={targetUsername}
          followersCount={followers}
          followingCount={following}
        />
      )}
    </>
  );
}
