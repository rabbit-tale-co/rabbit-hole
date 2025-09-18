"use client";

import { Button } from "@/components/ui/button";
import { OutlineUser, OutlineCompass, OutlineHeart } from "@/components/icons/Icons";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { TooltipContent } from "../ui/tooltip";

export type ProfileFeedType = "posts" | "replies" | "liked";

interface ProfileFeedSelectorProps {
  currentFeed: ProfileFeedType;
  onFeedChange: (feed: ProfileFeedType) => void;
  className?: string;
}

export function ProfileFeedSelector({
  currentFeed,
  onFeedChange,
  className,
}: ProfileFeedSelectorProps) {
  const feeds = [
    {
      id: "posts" as const,
      label: "Posts",
      description: "User's posts",
      icon: OutlineUser
    },
    {
      id: "replies" as const,
      label: "Replies",
      description: "User's replies",
      icon: OutlineCompass
    },
    {
      id: "liked" as const,
      label: "Liked",
      description: "Posts user liked",
      icon: OutlineHeart
    }
  ];

  return (
    <div className={cn("flex gap-2", className)}>
      {feeds.map((feed) => {
        const IconComponent = feed.icon;
        const isActive = currentFeed === feed.id;

        return (
          <TooltipProvider key={feed.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    onFeedChange(feed.id);
                  }}
                  className="rounded-full flex items-center gap-2"
                >
                  <IconComponent size={16} />
                  {feed.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{feed.description}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
