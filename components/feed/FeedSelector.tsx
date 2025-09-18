"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OutlinePlus, OutlineSettings, OutlineUser, OutlineCompass, OutlineHeart, OutlineImage } from "@/components/icons/Icons";
import { cn } from "@/lib/utils";
import { useRabbitHoles } from "@/hooks/useRabbitHoles";
import { usePinnedFeeds } from "@/hooks/usePinnedFeeds";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export type FeedType = "following" | "discover" | "mutuals" | "rabbit-hole";

interface FeedSelectorProps {
  currentFeed: FeedType;
  currentRabbitHole?: string;
  onFeedChange: (feed: FeedType, rabbitHole?: string) => void;
  className?: string;
}

export function FeedSelector({
  currentFeed,
  currentRabbitHole,
  onFeedChange,
}: FeedSelectorProps) {
  const [showRabbitHoles, setShowRabbitHoles] = useState(false);
  const { rabbitHoles, loading, createRabbitHole } = useRabbitHoles();
  const { pinnedFeeds, loading: pinnedLoading, syncExistingRabbitHoles } = usePinnedFeeds();

  const getIconForFeed = (feedId: string) => {
    switch (feedId) {
      case "following": return OutlineUser;
      case "discover": return OutlineCompass;
      case "mutuals": return OutlineUser;
      default: return OutlineCompass;
    }
  };

  // Sync existing rabbit holes to pinned feeds
  useEffect(() => {
    if (rabbitHoles && rabbitHoles.length > 0) {
      syncExistingRabbitHoles(rabbitHoles);
    }
  }, [rabbitHoles, syncExistingRabbitHoles]);

  return (
    <>
      {/* All Feeds in Order (System + Custom) */}
      {pinnedFeeds?.map((feed) => {
        const IconComponent = getIconForFeed(feed.feedId);
        const isActive = feed.type === "system"
          ? currentFeed === feed.feedId
          : currentFeed === "rabbit-hole" && currentRabbitHole === feed.feedId;

        return (
          <Tooltip key={feed.id}>
            <TooltipTrigger asChild>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onFeedChange(
                  feed.type === "system" ? feed.feedId as FeedType : "rabbit-hole",
                  feed.type === "rabbit-hole" ? feed.feedId : undefined
                )}
                className="rounded-full flex items-center gap-2"
              >
                <IconComponent size={16} />
                {feed.name}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{feed.description}</TooltipContent>
          </Tooltip>
        );
      })}
    </>
  );
}
