"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, InputAddon, InputWrapper } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserAvatar } from "@/components/ui/user-avatar";
import { toast } from "sonner";
import {
  OutlineSearch,
  OutlinePlus,
  OutlineSettings,
  OutlineUser,
  OutlineCompass,
  OutlineDragIndicator
} from "@/components/icons/Icons";
import { useRabbitHoles } from "@/hooks/useRabbitHoles";
import { useRabbitHoleOrder } from "@/hooks/useRabbitHoleOrder";
import { useDiscoverableRabbitHoles } from "@/hooks/useDiscoverableRabbitHoles";
import { usePinnedFeeds } from "@/hooks/usePinnedFeeds";
import { Sortable, SortableItem, SortableItemHandle } from "@/components/ui/sortable";
import { CreateRabbitHoleDialog } from "./CreateRabbitHoleDialog";
import { EditRabbitHoleDialog } from "./EditRabbitHoleDialog";

interface SystemRabbitHole {
  id: string;
  name: string;
  description: string;
  isSystem: true;
  icon: React.ReactNode;
}

type AllRabbitHole = SystemRabbitHole | import("@/hooks/useRabbitHoles").RabbitHole | {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  icon?: React.ReactNode;
  url?: string;
  avatar_url?: string;
  accent_color?: string;
};

type DiscoverHole = ReturnType<typeof useDiscoverableRabbitHoles>["rabbitHoles"][number];

export default function RabbitHolesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHole, setEditingHole] = useState<import("@/hooks/useRabbitHoles").RabbitHole | null>(null);
  const [addedHoles, setAddedHoles] = useState<Set<string>>(new Set());
  const [optimisticOrder, setOptimisticOrder] = useState<AllRabbitHole[] | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const { rabbitHoles, loading, createRabbitHole } = useRabbitHoles();
  const { getOrderedItems, updateOrder } = useRabbitHoleOrder();
  const { rabbitHoles: discoverableHoles, loading: discoverLoading } = useDiscoverableRabbitHoles(debouncedSearchQuery);
  const { pinnedFeeds, savedFeeds, unpinFeed, pinFeed, deleteFeed, reorderFeeds, addRabbitHoleToPinned, clearRemovedFeeds } = usePinnedFeeds();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Convert pinned feeds to display format
  const pinnedFeedsForDisplay = pinnedFeeds.map(feed => {
    if (feed.type === "system") {
      return {
        id: feed.id,
        name: feed.name,
        description: feed.description,
        isSystem: true,
        icon: feed.feedId === "following" ? <OutlineUser size={18} /> :
          feed.feedId === "discover" ? <OutlineSearch size={18} /> :
            feed.feedId === "mutuals" ? <OutlineUser size={18} /> :
              <OutlineCompass size={18} />
      };
    } else {
      // Find corresponding rabbit hole
      const rabbitHole = rabbitHoles.find(rh => rh.url === feed.feedId);
      return {
        id: feed.id,
        name: feed.name,
        description: feed.description,
        isSystem: false,
        url: feed.feedId,
        avatar_url: rabbitHole?.avatar_url,
        accent_color: rabbitHole?.accent_color
      };
    }
  });

  // Sort by order to maintain the correct sequence
  const orderedRabbitHoles = optimisticOrder || pinnedFeedsForDisplay.sort((a, b) => {
    const feedA = pinnedFeeds.find(f => f.id === a.id);
    const feedB = pinnedFeeds.find(f => f.id === b.id);
    return (feedA?.order || 0) - (feedB?.order || 0);
  });

  const handleCreateRabbitHole = () => setShowCreateModal(true);

  const handleAddToMyFeeds = async (hole: DiscoverHole) => {
    try {
      const result = await createRabbitHole(hole.name, hole.url, hole.description, []);
      if (result) {
        setAddedHoles(prev => new Set([...prev, hole.id]));

        // Add to pinned feeds
        await addRabbitHoleToPinned({
          id: result.id,
          name: hole.name,
          description: hole.description,
          url: hole.url
        });

        toast.success(`Added "${hole.name}" to your feeds`);
      }
    } catch (error) {
      console.error("Failed to add rabbit hole:", error);
      const apiError = error as any;
      if (apiError?.code === "DUPLICATE_URL" || apiError?.status === 409) {
        toast.error(`A rabbit hole with URL "${hole.url}" already exists in your feeds`);
        return;
      }
      toast.error("Failed to add rabbit hole");
    }
  };

  const isAlreadyAdded = (hole: DiscoverHole) => rabbitHoles.some(u => u.url === hole.url) || addedHoles.has(hole.id);

  const handleEditRabbitHole = (hole: AllRabbitHole) => {
    if ("isSystem" in hole && hole.isSystem) return; // system feeds are not editable
    setEditingHole(hole as import("@/hooks/useRabbitHoles").RabbitHole);
    setShowEditModal(true);
  };

  const handleReorder = async (newOrder: AllRabbitHole[]) => {
    setOptimisticOrder(newOrder);
    setIsSavingOrder(true);
    try {
      // Convert back to pinned feeds format
      const reorderedFeeds = newOrder.map((item, index) => {
        const originalFeed = pinnedFeeds.find(f => f.id === item.id);
        if (originalFeed) {
          return { ...originalFeed, order: index };
        }
        return null;
      }).filter((feed): feed is NonNullable<typeof feed> => feed !== null);

      await reorderFeeds(reorderedFeeds);
      toast.success("Your feeds were rearranged successfully.");
    } catch (err) {
      console.error("Order update error:", err);
      setOptimisticOrder(null);
      toast.error("Could not save order");
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <PageHeader
        backHref="/"
        backLabel="Back"
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <InputWrapper variant={'sm'}>
                <OutlineSearch size={16} />
                <Input
                  placeholder="Search discover…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56"
                />
              </InputWrapper>
              {/* <OutlineSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search discover…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-56"
              /> */}
            </div>
            <Button variant="secondary" onClick={handleCreateRabbitHole}>
              <OutlinePlus size={16} className="mr-2" /> New
            </Button>
            {/* <Button variant="outline" size="icon" aria-label="Settings">
              <OutlineSettings size={16} />
            </Button> */}
          </div>
        }
      />

      <div className="grid gap-4 py-4 lg:grid-cols-2">
        {/* My Feeds (Pinned) */}
        <section className="order-1 lg:order-1 rounded-xl border border-border/60 bg-card">
          <div className="flex items-center justify-between px-4 py-3 w-full">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-muted text-muted-foreground grid place-items-center">
                <OutlineUser size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold leading-tight">My Rabbit Holes</h2>
                <p className="text-xs text-muted-foreground">Drag to reorder</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {loading ? (
              <EmptyState loading />
            ) : orderedRabbitHoles.length === 0 ? (
              <EmptyState onCreate={handleCreateRabbitHole} />
            ) : (
              <Sortable
                value={orderedRabbitHoles}
                onValueChange={handleReorder}
                getItemValue={(hole) => hole.id}
                strategy="vertical"
                className="rounded-b-xl"
              >
                {orderedRabbitHoles.map((hole) => {
                  const isSystem = "isSystem" in hole && hole.isSystem;
                  const urlValue = "url" in hole ? hole.url : hole.id;
                  const viewHref = isSystem ? `/${hole.id}` : `/rabbitholes/${urlValue}`;
                  return (
                    <SortableItem
                      key={hole.id}
                      value={hole.id}
                      className="group flex items-center justify-between px-3 py-2 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar / Glyph */}
                        <div className="shrink-0">
                          {isSystem ? (
                            <div className="size-9 rounded-full grid place-items-center bg-muted text-muted-foreground">
                              {hole.icon}
                            </div>
                          ) : (
                            <UserAvatar
                              username={hole.name}
                              avatarUrl={"avatar_url" in hole ? hole.avatar_url : undefined}
                              size="sm"
                              accentHex={"accent_color" in hole ? (hole.accent_color as string) : undefined}
                              variant="rabbit-hole"
                            />
                          )}
                        </div>

                        {/* Title & meta */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 truncate">
                            <h3 className="truncate text-sm font-medium leading-none">{hole.name}</h3>
                            {isSystem && (
                              <Badge variant="outline" className="px-1.5 py-0 text-[10px]">System</Badge>
                            )}
                          </div>
                          {hole.description && (
                            <p className="truncate text-xs text-muted-foreground mt-1">{hole.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={viewHref}>View</Link>
                        </Button>
                        {!isSystem && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRabbitHole(hole)}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const feedId = isSystem ? hole.id : `rh-${hole.id}`;
                            unpinFeed(feedId);
                          }}
                        >
                          Unpin
                        </Button>
                        <SortableItemHandle>
                          <Button variant="ghost" size="icon" className="cursor-grab">
                            <OutlineDragIndicator size={16} />
                          </Button>
                        </SortableItemHandle>
                      </div>
                    </SortableItem>
                  );
                })}
              </Sortable>
            )}
          </div>
        </section>

        {/* Discover New Rabbit Holes */}
        <section className="order-3 lg:order-3 lg:col-span-2 rounded-xl border border-border/60 bg-card">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-blue-500/12 text-blue-600 grid place-items-center">
                <OutlineCompass size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold leading-tight">Discover</h2>
                <p className="text-xs text-muted-foreground">Community-made feeds to follow</p>
              </div>
            </div>
            {/* Mobile search */}
            {/* <div className="relative sm:hidden">
              <OutlineSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search discover…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-44"
            />
            </div> */}
          </div>

          <div className="divide-y divide-border/60">
            {discoverLoading ? (
              <DiscoverSkeleton />
            ) : discoverableHoles.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">No rabbit holes found.</div>
            ) : (
              discoverableHoles.map((hole) => {
                const already = isAlreadyAdded(hole);
                return (
                  <div key={hole.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
                    <UserAvatar
                      username={hole.name}
                      avatarUrl={hole.avatar}
                      size="md"
                      accentHex={hole.accent_color}
                      variant="rabbit-hole"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-medium leading-none">{hole.name}</h3>
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">Trending</Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground mt-1">{hole.description}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                        <span>{hole.likes.toLocaleString()} likes</span>
                        <span>{(hole.members + 1).toLocaleString()} members</span>
                        <span>{hole.posts.toLocaleString()} posts</span>
                      </div>
                    </div>
                    <Button
                      variant={already ? "secondary" : "default"}
                      size="sm"
                      onClick={() => handleAddToMyFeeds(hole)}
                      disabled={already}
                    >
                      <OutlinePlus size={14} className="mr-1.5" /> {already ? "Added" : "Add"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Saved Feeds */}
        <section className="order-2 lg:order-2 rounded-xl border border-border/60 bg-card">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-orange-500/12 text-orange-600 grid place-items-center">
                <OutlineSettings size={16} />
              </div>
              <div>
                <h2 className="text-base font-semibold leading-tight">Saved Feeds</h2>
                <p className="text-xs text-muted-foreground">Unpinned feeds you can manage</p>
              </div>
            </div>
            {savedFeeds.some(feed => ['liked'].includes(feed.feedId)) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearRemovedFeeds}
                className="text-xs"
              >
                Clear Old Feeds
              </Button>
            )}
          </div>

          <div className="divide-y divide-border/60">
            {savedFeeds.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">No saved feeds yet.</div>
            ) : (
              savedFeeds.map((feed) => (
                <div key={feed.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-muted text-muted-foreground grid place-items-center">
                      <OutlineCompass size={16} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium leading-none">{feed.name}</h3>
                      <p className="truncate text-xs text-muted-foreground mt-1">{feed.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => pinFeed(feed.id)}
                    >
                      Pin
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFeed(feed.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Dialogs */}
      <CreateRabbitHoleDialog open={showCreateModal} onOpenChange={setShowCreateModal} />
      {editingHole && (
        <EditRabbitHoleDialog open={showEditModal} onOpenChange={setShowEditModal} rabbitHole={editingHole} />
      )}
    </div>
  );
}

function EmptyState({ loading, onCreate }: { loading?: boolean; onCreate?: () => void }) {
  if (loading) {
    return (
      <div className="px-4 py-10 text-sm text-muted-foreground">
        <div className="h-4 w-40 animate-pulse rounded bg-muted/60" />
        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-muted/50" />
      </div>
    );
  }
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-sm text-muted-foreground">You haven\'t created any rabbit holes yet.</p>
      <Button variant="outline" className="mt-4" onClick={onCreate}>
        <OutlinePlus size={16} className="mr-2" /> Create your first
      </Button>
    </div>
  );
}

function DiscoverSkeleton() {
  return (
    <div className="px-4 py-3 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-muted/60 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-40 bg-muted/60 rounded animate-pulse" />
            <div className="mt-2 h-3 w-72 bg-muted/50 rounded animate-pulse" />
          </div>
          <div className="h-8 w-16 bg-muted/60 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
