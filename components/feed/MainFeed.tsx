"use client";

import { useState } from "react";
import { FeedSelector, FeedType } from "./FeedSelector";
import Feed from "./Index";
import { EmptyState } from "./Empty";

export function MainFeed() {
  const [currentFeed, setCurrentFeed] = useState<FeedType>("discover");
  const [currentRabbitHole, setCurrentRabbitHole] = useState<string | undefined>();

  const handleFeedChange = (feed: FeedType, rabbitHole?: string) => {
    setCurrentFeed(feed);
    setCurrentRabbitHole(rabbitHole);
  };

  const getFeedProps = () => {
    switch (currentFeed) {
      case "following":
        return { following: true };
      case "discover":
        return {};
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
      case "rabbit-hole":
        return "rabbit-hole";
      default:
        return "home";
    }
  };

  return (
    <div className="space-y-4">
      {/* Sticky Feed Selector */}
      <div className="sticky top-16 z-30">
        <div className="flex items-center justify-center h-16 gap-4 px-4">
          <div className="flex rounded-full p-1 items-center gap-1 bg-background">
            <FeedSelector
              currentFeed={currentFeed}
              currentRabbitHole={currentRabbitHole}
              onFeedChange={handleFeedChange}
            />
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="max-w-4xl mx-auto px-4">
        <Feed
          {...getFeedProps()}
          emptyStateVariant={getEmptyStateVariant()}
        />
      </div>
    </div>
  );
}
