"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  OutlineSearch,
  OutlinePlus,
  OutlineSettings,
  OutlineUser,
  OutlineCompass
} from "@/components/icons/Icons";
import { useRabbitHoles } from "@/hooks/useRabbitHoles";
import { useRabbitHoleOrder } from "@/hooks/useRabbitHoleOrder";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SystemRabbitHole {
  id: string;
  name: string;
  description: string;
  isSystem: true;
  icon: string;
}

type AllRabbitHole = SystemRabbitHole | import("@/hooks/useRabbitHoles").RabbitHole;

export function RabbitHolesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { rabbitHoles, loading, createRabbitHole } = useRabbitHoles();
  const { getOrderedItems, updateOrder } = useRabbitHoleOrder();

  // Default system rabbit holes that cannot be deleted
  const defaultRabbitHoles: SystemRabbitHole[] = [
    {
      id: "discover",
      name: "Discover",
      description: "Explore new posts and trending content",
      isSystem: true,
      icon: "🔍"
    },
    {
      id: "following",
      name: "Following",
      description: "Posts from people you follow",
      isSystem: true,
      icon: "👥"
    }
  ];

  // Combine system and user rabbit holes
  const allRabbitHoles: AllRabbitHole[] = [...defaultRabbitHoles, ...rabbitHoles];

  // Get ordered rabbit holes
  const orderedRabbitHoles = getOrderedItems(allRabbitHoles);

  // Mock data for discoverable rabbit holes
  const discoverableHoles = [
    {
      id: "art",
      name: "Art & Creative",
      description: "Share your artistic creations and discover amazing art from the community",
      creator: "Feed by @artcommunity",
      likes: 2847,
      avatar: "🎨",
      color: "#ff6b6b"
    },
    {
      id: "tech",
      name: "Technology",
      description: "Latest tech news, programming discussions, and innovation updates",
      creator: "Feed by @techhub",
      likes: 1923,
      avatar: "💻",
      color: "#4ecdc4"
    },
    {
      id: "music",
      name: "Music",
      description: "Share music, discover new artists, and discuss your favorite genres",
      creator: "Feed by @musiclovers",
      likes: 1567,
      avatar: "🎵",
      color: "#45b7d1"
    },
    {
      id: "gaming",
      name: "Gaming",
      description: "Gaming news, reviews, and community discussions",
      creator: "Feed by @gamers",
      likes: 3241,
      avatar: "🎮",
      color: "#96ceb4"
    },
    {
      id: "nature",
      name: "Nature & Environment",
      description: "Beautiful nature photos, environmental discussions, and outdoor adventures",
      creator: "Feed by @naturelovers",
      likes: 1892,
      avatar: "🌿",
      color: "#feca57"
    }
  ];

  const filteredDiscoverable = discoverableHoles.filter(hole =>
    hole.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hole.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRabbitHole = async () => {
    const name = prompt("Nazwa rabbit hole:");
    if (!name?.trim()) return;

    const description = prompt("Opis (opcjonalnie):");
    const rules = prompt("Zasady (opcjonalnie):");

    await createRabbitHole(
      name.trim(),
      description?.trim(),
      rules?.trim()
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader
        title="Rabbit Holes"
        backHref="/"
        backLabel="Back"
        actions={
          <Button variant="outline" size={'icon'}>
            <OutlineSettings size={16} />
          </Button>
        }
      />

      <div className="py-6 space-y-8">
        {/* My Rabbit Holes Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <OutlineUser size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">My Rabbit Holes</h2>
              <p className="text-sm text-muted-foreground">
                Your personalized feeds, right in one place.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading your rabbit holes...
              </div>
            ) : orderedRabbitHoles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven't created any rabbit holes yet.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleCreateRabbitHole}
                >
                  <OutlinePlus size={16} className="mr-2" />
                  Create Your First Rabbit Hole
                </Button>
              </div>
            ) : (
              orderedRabbitHoles.map((hole) => {
                const isSystem = 'isSystem' in hole && hole.isSystem;
                return (
                  <div
                    key={hole.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                          isSystem ? "bg-blue-500" : "bg-primary"
                        )}
                      >
                        {isSystem ? hole.icon : hole.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{hole.name}</h3>
                          {isSystem && (
                            <Badge variant="secondary" className="text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                        {hole.description && (
                          <p className="text-sm text-muted-foreground">
                            {hole.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={isSystem ? `/${hole.id}` : `/rabbit-hole/${hole.id}`}>
                          View
                        </Link>
                      </Button>
                      {!isSystem && (
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      )}
                      {isSystem && (
                        <Button variant="ghost" size="sm" disabled>
                          <OutlineSettings size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Discover New Rabbit Holes Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <OutlineCompass size={16} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Discover New Rabbit Holes</h2>
              <p className="text-sm text-muted-foreground">
                Choose your own timeline! Rabbit holes built by the community help you find content you love.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <OutlineSearch
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search rabbit holes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Discoverable Rabbit Holes */}
          <div className="space-y-3">
            {filteredDiscoverable.map((hole) => (
              <div
                key={hole.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: hole.color }}
                  >
                    {hole.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{hole.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        Trending
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {hole.creator}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {hole.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Liked by {hole.likes.toLocaleString()} users
                    </p>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <OutlinePlus size={16} />
                  Add to My Feeds
                </Button>
              </div>
            ))}
          </div>

          {filteredDiscoverable.length === 0 && searchQuery && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No rabbit holes found for "{searchQuery}"</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
