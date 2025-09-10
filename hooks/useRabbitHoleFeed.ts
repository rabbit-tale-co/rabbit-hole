"use client";

import { useEffect, useState } from "react";
import { useInfiniteFeed } from "./useInfiniteFeed";

export function useRabbitHoleFeed(rabbitHoleName: string) {
  const [rabbitHole, setRabbitHole] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use infinite feed hook for posts
  const { items, loadMore, loading: feedLoading, error: feedError, hasMore, refresh } = useInfiniteFeed(
    undefined, // no initial data
    24,
    { rabbitHole: rabbitHoleName }
  );

  useEffect(() => {
    const fetchRabbitHole = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/rabbit-holes/${rabbitHoleName}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch rabbit hole");
        }

        const data = await response.json();
        setRabbitHole(data.rabbitHole);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        setRabbitHole(null);
      } finally {
        setLoading(false);
      }
    };

    if (rabbitHoleName) {
      fetchRabbitHole();
    }
  }, [rabbitHoleName]);

  return {
    rabbitHole,
    items,
    loadMore,
    loading: loading || feedLoading,
    error: error || feedError,
    hasMore,
    refresh,
  };
}
