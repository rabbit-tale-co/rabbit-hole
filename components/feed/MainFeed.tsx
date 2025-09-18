"use client";

import { useState, useEffect } from "react";
import { FeedSelector, FeedType } from "./FeedSelector";
import Feed from "./Index";
import { useRabbitHoles } from "@/hooks/useRabbitHoles";
import { usePinnedFeeds } from "@/hooks/usePinnedFeeds";
import { BentoSkeleton } from "./Loading";
import { TooltipProvider } from "../ui/tooltip";

const FEED_STORAGE_KEY = "rabbit-hole-selected-feed";
const RABBIT_HOLE_STORAGE_KEY = "rabbit-hole-selected-rabbit-hole";

export function MainFeed() {
  const [currentFeed, setCurrentFeed] = useState<FeedType>("discover");
  const [currentRabbitHole, setCurrentRabbitHole] = useState<string | undefined>();
  const [isHydrated, setIsHydrated] = useState(false);
  const { loading: rabbitHolesLoading, rabbitHoles } = useRabbitHoles();
  const { loading: pinnedLoading } = usePinnedFeeds();

  // Load saved feed from localStorage after hydration
  useEffect(() => {
    const savedFeed = localStorage.getItem(FEED_STORAGE_KEY) as FeedType;
    const savedRabbitHole = localStorage.getItem(RABBIT_HOLE_STORAGE_KEY);

    if (savedFeed && ["discover", "following", "mutuals", "rabbit-hole"].includes(savedFeed)) {
      setCurrentFeed(savedFeed);
    }

    if (savedRabbitHole) {
      setCurrentRabbitHole(savedRabbitHole);
    }

    setIsHydrated(true);
  }, []);

  const handleFeedChange = (feed: FeedType, rabbitHole?: string) => {
    setCurrentFeed(feed);
    setCurrentRabbitHole(rabbitHole);

    // Save to localStorage
    localStorage.setItem(FEED_STORAGE_KEY, feed);
    if (rabbitHole) {
      localStorage.setItem(RABBIT_HOLE_STORAGE_KEY, rabbitHole);
    } else {
      localStorage.removeItem(RABBIT_HOLE_STORAGE_KEY);
    }
  };

  const getFeedProps = () => {
    switch (currentFeed) {
      case "following":
        return { following: true };
      case "discover":
        return {};
      case "mutuals":
        return { mutuals: true };
      case "rabbit-hole":
        return { rabbitHole: currentRabbitHole };
      default:
        return {};
    }
  };

  const getEmptyStateVariant = () => {
    switch (currentFeed) {
      case "following":
        return "following";
      case "discover":
        return "home";
      case "mutuals":
        return "following";
      case "rabbit-hole":
        return "home";
      default:
        return "home";
    }
  };

  // Show loading state during hydration or when any data is loading
  if (!isHydrated || rabbitHolesLoading || pinnedLoading) {
    return (
      <div className="space-y-4">
        {/* Sticky Feed Selector - Loading */}
        <div className="sticky top-16 z-30">
          <div className="flex items-center h-16 gap-4">
            <div className="flex rounded-full p-1 items-center gap-1 bg-background">
              <div className="animate-pulse bg-gray-200 rounded-full h-8 w-20"></div>
              <div className="animate-pulse bg-gray-200 rounded-full h-8 w-20"></div>
              <div className="animate-pulse bg-gray-200 rounded-full h-8 w-16"></div>
            </div>
          </div>
        </div>

        {/* Feed Content - Loading */}
        <div className="max-w-4xl mx-auto">
          <BentoSkeleton
            cols={3}
            containerWidth={896}
            gap={12}
            count={12}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sticky Feed Selector */}
      <div className="sticky top-16 z-30">
        <div className="flex items-center gap-4">
          <div className="flex rounded-full p-1 items-center gap-1 bg-background">
            <TooltipProvider delayDuration={150}>
              <FeedSelector
                currentFeed={currentFeed}
                currentRabbitHole={currentRabbitHole}
                onFeedChange={handleFeedChange}
              />
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="max-w-4xl mx-auto">
        <Feed
          {...getFeedProps()}
          emptyStateVariant={getEmptyStateVariant()}
        />
      </div>
    </div>
  );
}
