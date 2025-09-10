"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OutlinePlus, OutlineSettings, OutlineUser, OutlineCompass } from "@/components/icons/Icons";
import { cn } from "@/lib/utils";
import { useRabbitHoles } from "@/hooks/useRabbitHoles";

export type FeedType = "following" | "discover" | "rabbit-hole";

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
  className
}: FeedSelectorProps) {
  const [showRabbitHoles, setShowRabbitHoles] = useState(false);
  const { rabbitHoles, loading, createRabbitHole } = useRabbitHoles();

  const feeds = [
    {
      id: "following" as const,
      label: "Following",
      icon: OutlineUser,
      description: "Posty od osób które followujesz"
    },
    {
      id: "discover" as const,
      label: "Discover",
      icon: OutlineCompass,
      description: "Odkryj nowe posty"
    }
  ];

  const handleCreateRabbitHole = async () => {
    const name = prompt("Nazwa rabbit hole:");
    if (!name?.trim()) return;

    const description = prompt("Opis (opcjonalnie):");
    const rules = prompt("Zasady (opcjonalnie):");

    await createRabbitHole(name.trim(), description?.trim(), rules?.trim());
  };

  return (
    <>
      {/* Main Feed Options */}
      {feeds.map((feed) => (
        <Button
          key={feed.id}
          variant={currentFeed === feed.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onFeedChange(feed.id)}
          className="rounded-full flex items-center gap-2"
        >
          <feed.icon size={16} />
          {feed.label}
        </Button>
      ))}

      {/* Rabbit Holes Dropdown */}
      <div className="relative">
        <Button
          variant={currentFeed === "rabbit-hole" ? "default" : "ghost"}
          size="sm"
          onClick={() => setShowRabbitHoles(!showRabbitHoles)}
          className="rounded-full flex items-center gap-2"
        >
          <OutlineSettings size={16} />
          Rabbit Holes
        </Button>

        {showRabbitHoles && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg p-4 z-50">
            <div className="space-y-2">
              {loading ? (
                <div className="text-sm text-muted-foreground text-center py-4">Ładowanie...</div>
              ) : (
                <>
                  {rabbitHoles.map((hole) => (
                    <Button
                      key={hole.id}
                      variant={currentRabbitHole === hole.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => onFeedChange("rabbit-hole", hole.id)}
                    >
                      {hole.name}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center gap-2"
                    onClick={handleCreateRabbitHole}
                  >
                    <OutlinePlus size={16} />
                    Dodaj nowy
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
