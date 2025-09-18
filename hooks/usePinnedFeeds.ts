"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

export interface PinnedFeed {
  id: string;
  type: "system" | "rabbit-hole";
  feedId: string; // "following", "discover", "mutuals", etc. or rabbit hole URL
  name: string;
  description: string;
  icon?: string;
  order: number;
  isPinned: boolean;
}

export function usePinnedFeeds() {
  const { user } = useAuth();
  const [pinnedFeeds, setPinnedFeeds] = useState<PinnedFeed[]>([]);
  const [savedFeeds, setSavedFeeds] = useState<PinnedFeed[]>([]);
  const [loading, setLoading] = useState(false);

  // Default system feeds - these will be reorderable
  const defaultSystemFeeds: PinnedFeed[] = [
    {
      id: "following",
      type: "system",
      feedId: "following",
      name: "Following",
      description: "Posts from people you follow",
      order: 0,
      isPinned: true
    },
    {
      id: "discover",
      type: "system",
      feedId: "discover",
      name: "Discover",
      description: "Discover new posts",
      order: 1,
      isPinned: true
    },
    {
      id: "mutuals",
      type: "system",
      feedId: "mutuals",
      name: "Mutuals",
      description: "Posts from mutual follows",
      order: 2,
      isPinned: true
    }
  ];

  const fetchPinnedFeeds = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // For now, use localStorage. Later can be moved to database
      const stored = localStorage.getItem(`pinned-feeds-${user.id}`);
      const data = stored ? JSON.parse(stored) : { pinned: defaultSystemFeeds, saved: [] };

      // Filter out removed feeds (liked - only exists in user profile)
      const validPinnedFeeds = (data.pinned || defaultSystemFeeds).filter((feed: PinnedFeed) =>
        !['liked'].includes(feed.feedId)
      );

      const validSavedFeeds = (data.saved || []).filter((feed: PinnedFeed) =>
        !['liked'].includes(feed.feedId)
      );

      // If we filtered out some feeds, save the cleaned data
      if (validPinnedFeeds.length !== (data.pinned || []).length ||
          validSavedFeeds.length !== (data.saved || []).length) {
        await savePinnedFeeds(validPinnedFeeds, validSavedFeeds);
      }

      setPinnedFeeds(validPinnedFeeds);
      setSavedFeeds(validSavedFeeds);
    } catch (error) {
      console.error("Error fetching pinned feeds:", error);
      setPinnedFeeds(defaultSystemFeeds);
      setSavedFeeds([]);
    } finally {
      setLoading(false);
    }
  };

  const savePinnedFeeds = async (pinned: PinnedFeed[], saved: PinnedFeed[]) => {
    if (!user) return;

    try {
      const data = { pinned, saved };
      localStorage.setItem(`pinned-feeds-${user.id}`, JSON.stringify(data));
      setPinnedFeeds(pinned);
      setSavedFeeds(saved);
    } catch (error) {
      console.error("Error saving pinned feeds:", error);
    }
  };

  const unpinFeed = async (feedId: string) => {
    const pinned = [...pinnedFeeds];
    const saved = [...savedFeeds];

    const feedIndex = pinned.findIndex(f => f.id === feedId);
    if (feedIndex !== -1) {
      const feed = pinned[feedIndex];
      feed.isPinned = false;
      feed.order = saved.length;

      saved.push(feed);
      pinned.splice(feedIndex, 1);

      // Reorder remaining pinned feeds
      pinned.forEach((f, index) => {
        f.order = index;
      });

      await savePinnedFeeds(pinned, saved);
    }
  };

  const pinFeed = async (feedId: string) => {
    const pinned = [...pinnedFeeds];
    const saved = [...savedFeeds];

    const feedIndex = saved.findIndex(f => f.id === feedId);
    if (feedIndex !== -1) {
      const feed = saved[feedIndex];
      feed.isPinned = true;
      feed.order = pinned.length;

      pinned.push(feed);
      saved.splice(feedIndex, 1);

      await savePinnedFeeds(pinned, saved);
    }
  };

  const deleteFeed = async (feedId: string) => {
    const pinned = [...pinnedFeeds];
    const saved = [...savedFeeds];

    // Remove from both arrays
    const pinnedIndex = pinned.findIndex(f => f.id === feedId);
    const savedIndex = saved.findIndex(f => f.id === feedId);

    if (pinnedIndex !== -1) {
      pinned.splice(pinnedIndex, 1);
      // Reorder remaining pinned feeds
      pinned.forEach((f, index) => {
        f.order = index;
      });
    }

    if (savedIndex !== -1) {
      saved.splice(savedIndex, 1);
    }

    await savePinnedFeeds(pinned, saved);
  };

  const reorderFeeds = async (newOrder: PinnedFeed[]) => {
    const reordered = newOrder.map((feed, index) => ({
      ...feed,
      order: index
    }));

    await savePinnedFeeds(reordered, savedFeeds);
  };

  const addRabbitHoleToPinned = async (rabbitHole: { id: string; name: string; description: string; url: string }) => {
    const newFeed: PinnedFeed = {
      id: `rh-${rabbitHole.id}`,
      type: "rabbit-hole",
      feedId: rabbitHole.url,
      name: rabbitHole.name,
      description: rabbitHole.description,
      order: pinnedFeeds.length,
      isPinned: true
    };

    const pinned = [...pinnedFeeds, newFeed];
    await savePinnedFeeds(pinned, savedFeeds);
  };

  const syncExistingRabbitHoles = async (rabbitHoles: Array<{ id: string; name: string; description?: string; url: string }>) => {
    if (!user || rabbitHoles.length === 0) return;

    const existingRabbitHoleIds = new Set(
      [...pinnedFeeds, ...savedFeeds]
        .filter(feed => feed.type === "rabbit-hole")
        .map(feed => feed.id.replace('rh-', ''))
    );

    const newRabbitHoles = rabbitHoles.filter(rh => !existingRabbitHoleIds.has(rh.id));

    if (newRabbitHoles.length > 0) {
      // Find the highest order number among existing pinned feeds
      const maxOrder = pinnedFeeds.length > 0 ? Math.max(...pinnedFeeds.map(f => f.order)) : -1;

      const newFeeds: PinnedFeed[] = newRabbitHoles.map((rh, index) => ({
        id: `rh-${rh.id}`,
        type: "rabbit-hole",
        feedId: rh.url,
        name: rh.name,
        description: rh.description || "Custom rabbit hole",
        order: maxOrder + 1 + index,
        isPinned: true
      }));

      const updatedPinned = [...pinnedFeeds, ...newFeeds];
      await savePinnedFeeds(updatedPinned, savedFeeds);
    }
  };

  const clearRemovedFeeds = async () => {
    if (!user) return;

    // Remove liked from both pinned and saved feeds (liked only exists in user profile)
    const cleanedPinned = pinnedFeeds.filter(feed =>
      !['liked'].includes(feed.feedId)
    );

    const cleanedSaved = savedFeeds.filter(feed =>
      !['liked'].includes(feed.feedId)
    );

    await savePinnedFeeds(cleanedPinned, cleanedSaved);
  };

  useEffect(() => {
    if (user) {
      fetchPinnedFeeds();
    }
  }, [user]);

  return {
    pinnedFeeds,
    savedFeeds,
    loading,
    unpinFeed,
    pinFeed,
    deleteFeed,
    reorderFeeds,
    addRabbitHoleToPinned,
    syncExistingRabbitHoles,
    clearRemovedFeeds
  };
}
