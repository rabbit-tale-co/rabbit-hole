import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ProfileStatsProps {
  posts: number;
  following: number;
  followers: number;
  onClickPosts?: () => void;
  onClickFollowing?: () => void;
  onClickFollowers?: () => void;
}

export function ProfileStats({ posts, following, followers, onClickPosts, onClickFollowing, onClickFollowers }: ProfileStatsProps) {
  return (
    <div className="flex justify-center h-8 items-center space-x-1 tabular-nums">
      <Button
        variant="ghost"
        size="sm"
        className="font-mono"
        onClick={onClickPosts}
      >
        <h4 className="font-semibold text-neutral-950 mr-0.5">{posts.toLocaleString()}</h4>
        <span className="text-neutral-500">Posts</span>
      </Button>
      <Separator orientation="vertical" className="!h-4" />
      <Button
        variant="ghost"
        size="sm"
        className="font-mono"
        onClick={onClickFollowing}
      >
        <h4 className="font-semibold text-neutral-950 mr-0.5">{following.toLocaleString()}</h4>
        <span className="text-neutral-500">Following</span>
      </Button>
      <Separator orientation="vertical" className="!h-4" />
      <Button
        variant="ghost"
        size="sm"
        className="font-mono"
        onClick={onClickFollowers}
      >
        <h4 className="font-semibold text-neutral-950 mr-0.5">{followers.toLocaleString()}</h4>
        <span className="text-neutral-500">Followers</span>
      </Button>
    </div>
  );
}
