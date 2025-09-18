"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import ProfileEmptyGallery, { HomeEmptyFeed } from "@/components/feed/Empty";
import { HoverSlideshow } from "@/components/feed/HoverSlideshow";
import { SocialActions } from "@/components/feed/interactions/social-actions";
import { BentoSkeleton } from "@/components/feed/Loading";
import { PostImpressionTracker } from "@/components/feed/PostImpressionTracker";
import { PostStats } from "@/components/feed/PostStats";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFeed } from "@/hooks/useFeed";
import { OutlineCalendar } from "../icons/Icons";
import { Badge } from "../ui/badge";
import { TypographyP } from "../ui/typography/p";
import { UserChipHoverCard } from "../user/ProfileCard";
import { EmptyState } from "./Empty";
import { Button } from "../ui/button";
import { ProfileFeedType } from "../user/ProfileFeedSelector";

// Stable motion variants to prevent re-renders
const postVariants = {
  rest: {
    opacity: 0,
    y: 8,
  },
  hover: {
    opacity: 1,
    y: 0,
  },
};

const textVariants = {
  hover: {
    filter: "blur(0px)",
  },
  rest: {
    filter: "blur(8px)",
  },
};

// Stable transition objects to prevent re-renders
const motionTransition = { duration: 0.15, ease: "easeOut" as const };
const articleTransition = { duration: 0.3, ease: "easeOut" as const };

// Stable callback functions to prevent re-renders
const handleLike = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleComment = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleRepost = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleBookmark = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

// Memoized PostItem component to prevent unnecessary re-renders
const PostItem = memo(({
  p,
  post,
  publicUrl,
  animateGate,
  handlePostClick,
  profile,
  username,
  profileFeedType
}: {
  p: any;
  post: any;
  publicUrl: (path: string) => string;
  animateGate: boolean;
  handlePostClick: (postId: string) => void;
  profile: any;
  username?: string;
  profileFeedType?: ProfileFeedType;
}) => {
  const dateLabel = post?.created_at
    ? new Date(post.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "";

  const medias = post?.images || [];
  const first = medias[0];
  const firstUrl = first ? publicUrl(first.path || "") : "";
  const isVideo = first ? String(first.mime || "").startsWith("video/") : false;

  // Calculate dimensions from tile data
  const width = p.tile.w * 200 + (p.tile.w - 1) * 12; // Approximate calculation
  const height = p.tile.h * 200 + (p.tile.h - 1) * 12; // Approximate calculation

  return (
    <motion.article
      key={p.tile.id}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/[0.05] transition-all duration-300 hover:shadow-lg hover:ring-black/[0.1] dark:bg-neutral-900 dark:ring-white/[0.1]"
      onClick={() => handlePostClick(p.tile.id)}
      style={{
        left: p.tile.x * (p.tile.w + 12),
        top: p.tile.y * (p.tile.h + 12),
        width,
        height,
        minWidth: 160,
        minHeight: 160,
        willChange: "transform, opacity",
        transform: "translateZ(0)", // Force hardware acceleration
        backfaceVisibility: "hidden" // Prevent flickering
      }}
      initial="rest"
      whileHover="hover"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Track impressions for this post */}
      <PostImpressionTracker postId={p.tile.id} />

      {/* User header */}
      {profile && (!username || profileFeedType === "liked") && (
        <div
          className="absolute top-2 left-2 sm:top-3 sm:left-3 z-30 text-white"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <UserChipHoverCard
            user={{
              user_id: profile.user_id,
              username: profile.username,
              avatarUrl: profile.avatar_url,
              displayName: profile.display_name,
              bio: profile.bio,
              coverUrl: profile.cover_url,
              isPremium: profile.is_premium,
            }}
            size={"sm"}
            insideLink
          />
        </div>
      )}

      {/* Media content */}
      {first && (
        <div className="absolute inset-0">
          {isVideo ? (
            <video
              src={firstUrl}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <Image
              src={firstUrl}
              alt={first.alt || ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              loading="lazy"
              placeholder="blur"
            />
          )}
        </div>
      )}

      {/* Top gradient + metadata row */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
      <div className="absolute flex items-center justify-between inset-x-0 top-0 p-2 sm:p-3 pointer-events-none">
        {/* Date */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-black/50 text-white">
              <OutlineCalendar />
              {dateLabel}
            </Badge>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="center"
            className="text-xs"
          >
            {post?.created_at
              ? new Date(post.created_at).toLocaleString()
              : ""}
          </TooltipContent>
        </Tooltip>

        {/* Post Stats */}
        <PostStats stats={post?.stats} animateGate={animateGate} />
      </div>

      {/* Bottom gradient + actions row */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      <div className="absolute flex flex-col gap-2 inset-x-0 bottom-0 p-2 sm:p-3 pointer-events-none">
        {/* Post preview: bottom-anchored, max 3 lines */}
        {post?.text && (
          <motion.div
            className="w-full pointer-events-none transform-gpu [will-change:opacity,transform,filter] md:opacity-0 md:y-8"
            variants={postVariants}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {/* 3 lines * 1.25rem line-height = 3.75rem */}
            <div className="min-h-[3.75rem] flex flex-col justify-end">
              <motion.div
                className="[will-change:filter] md:blur-0"
                variants={textVariants}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <TypographyP
                  className="
                  text-xs text-white leading-[1.25rem]
                  line-clamp-3 text-left
                  [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]
                "
                >
                  {post.text}
                </TypographyP>
              </motion.div>
            </div>
          </motion.div>
        )}
        <SocialActions
          postId={p.tile.id}
          likes={post?.like_count ?? 0}
          comments={post?.comment_count ?? 0}
          reposts={post?.repost_count ?? 0}
          bookmarks={post?.bookmark_count ?? 0}
          isLiked={post?.is_liked ?? false}
          isReposted={false}
          isBookmarked={false}
          showBookmarksCount={false}
          animateGate={animateGate}
          onLike={handleLike}
          onComment={handleComment}
          onRepost={handleRepost}
          onBookmark={handleBookmark}
        />
      </div>
    </motion.article>
  );
});

PostItem.displayName = "PostItem";

const Feed = memo(function Feed({
  initial,
  username,
  isOwnProfile,
  onCountChange,
  forceUpdate,
  following,
  rabbitHole,
  emptyStateVariant,
  profileFeedType,
}: {
  initial?: any;
  username?: string;
  isOwnProfile?: boolean;
  onCountChange?: (n: number) => void;
  forceUpdate?: number;
  following?: boolean;
  rabbitHole?: string;
  emptyStateVariant?: "home" | "following" | "rabbit-hole";
  profileFeedType?: ProfileFeedType;
}) {
  const {
    items,
    tiles,
    idToPost,
    authorProfiles,
    cols,
    placed,
    containerWidth,
    containerHeight,
    cell,
    gap,
    loading,
    error,
    hasMore,
    feedReady,
    animateGate,
    isTransitioning,
    rootRef,
    sentinelRef,
    loadMore,
    handlePostClick,
    publicUrl,
  } = useFeed(initial, username, isOwnProfile, onCountChange, forceUpdate, following, rabbitHole, profileFeedType);

  // Create memoized user objects to prevent UserChipHoverCard re-renders
  // MUST be before any early returns to avoid Rules of Hooks violation
  const memoizedUsers = useMemo(() => {
    const users = new Map();
    placed.forEach((p) => {
      const post = idToPost.get(p.tile.id);
      if (post) {
        const profile = authorProfiles.get(post.author_id);
        if (profile) {
          users.set(p.tile.id, {
            user_id: profile.user_id,
            username: profile.username,
            avatarUrl: profile.avatar_url,
            displayName: profile.display_name,
            bio: profile.bio,
            coverUrl: profile.cover_url,
            isPremium: profile.is_premium,
          });
        }
      }
    });
    return users;
  }, [placed, idToPost, authorProfiles]);

  // container width is already provided by useFeed hook

  // initial loading (no items yet) or container not measured
  const firstLoad = items.length === 0 && loading;

  if (firstLoad || cell <= 0) {
    return (
      <div ref={rootRef} className="w-full max-w-[56rem] mx-auto mt-6">
        <BentoSkeleton
          cols={cols}
          containerWidth={containerWidth}
          gap={gap}
          count={6}
        />
      </div>
    );
  }

  if (!loading && items.length === 0) {
    // Use emptyStateVariant if provided, otherwise fall back to legacy logic
    if (emptyStateVariant) {
      switch (emptyStateVariant) {
        case "following":
          return (
            <EmptyState
              variant="following"
              isOwnProfile={false}
              message="No posts yet"
              description="When people you follow post something, it'll show up here."
            />
          );
        case "rabbit-hole":
          return (
            <EmptyState
              variant="rabbit-hole"
              isOwnProfile={false}
              message="No posts yet"
              description={`Be the first to post in r/${rabbitHole || 'this rabbit hole'}!`}
            />
          );
        case "home":
        default:
          return <HomeEmptyFeed />;
      }
    }

  }

  // Early returns for empty states - MUST be after all hooks
  if (!feedReady) {
    return <BentoSkeleton cols={cols} containerWidth={containerWidth} />;
  }

  if (items.length === 0) {
    // Legacy logic for backward compatibility
    if (following) {
      return (
        <EmptyState
          variant="following"
          isOwnProfile={false}
          message="No posts yet"
          description="When people you follow post something, it'll show up here."
        />
      );
    }
    if (rabbitHole) {
      return (
        <EmptyState
          variant="rabbit-hole"
          isOwnProfile={false}
          message="No posts yet"
          description={`Be the first to post in r/${rabbitHole}!`}
        />
      );
    }
    // Handle profile feed types
    if (username && profileFeedType) {
      switch (profileFeedType) {
        case "posts":
          return <ProfileEmptyGallery isOwnProfile={!!isOwnProfile} />;
        case "replies":
          return (
            <EmptyState
              variant="following"
              isOwnProfile={!!isOwnProfile}
              message="No replies yet"
              description={isOwnProfile ? "You haven't replied to any posts yet." : "This user hasn't replied to any posts yet."}
            />
          );
        case "liked":
          return (
            <EmptyState
              variant="following"
              isOwnProfile={!!isOwnProfile}
              message="No liked posts yet"
              description={isOwnProfile ? "You haven't liked any posts yet." : "This user hasn't liked any posts yet."}
            />
          );
        default:
          return <ProfileEmptyGallery isOwnProfile={!!isOwnProfile} />;
      }
    }

    return username ? (
      <ProfileEmptyGallery isOwnProfile={!!isOwnProfile} />
    ) : (
      <HomeEmptyFeed />
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div ref={rootRef} className="w-full max-w-[56rem] mx-auto mt-6">
        {/* hover slideshow handled within tiles; click-through to post page */}

        <div
          className={`relative transition-all duration-300 ease-out ${isTransitioning ? "opacity-70" : "opacity-100"
            }`}
          style={{ height: containerHeight, minHeight: Math.max(240, cell) }}
        >
          {placed.map((p) => {
            const top = p.y * (cell + gap);
            const left = p.x * (cell + gap);
            const width = Math.max(1, p.w * cell + (p.w - 1) * gap);
            const height = Math.max(1, p.h * cell + (p.h - 1) * gap);

            return (
              <motion.article
                key={p.tile.id}
                data-post-id={p.tile.id}
                onClick={() => handlePostClick(p.tile.id)}
                className={`group absolute bg-neutral-100 dark:bg-neutral-900 ring-1 ring-ring/30 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ease-out ${isTransitioning
                  ? "opacity-50 scale-95"
                  : "opacity-100 scale-100"
                  }`}
                style={{
                  top,
                  left,
                  width,
                  height,
                  minWidth: 160,
                  minHeight: 160,
                  willChange: "transform, opacity",
                  transform: "translateZ(0)", // Force hardware acceleration
                  backfaceVisibility: "hidden" // Prevent flickering
                }}
                initial="rest"
                whileHover="hover"
                transition={articleTransition}
              >
                {/* Track impressions for this post */}
                <PostImpressionTracker postId={p.tile.id} />

                {(() => {
                  const post = idToPost.get(p.tile.id);
                  console.log("[Feed] Post data:", { id: p.tile.id, hasStats: !!post?.stats, stats: post?.stats });
                  const medias = post?.images || [];
                  const first = medias[0];
                  if (!first) return null;
                  const firstUrl = publicUrl(first.path || "");
                  const isVideo = String(first.mime || "").startsWith("video/");
                  if (isVideo) {
                    return (
                      <div className="absolute inset-0">
                        <video
                          src={firstUrl}
                          className="absolute inset-0 w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                      </div>
                    );
                  }
                  // First is image: build slideshow only from image assets (skip videos to avoid Next/Image errors)
                  const restImageMedias = medias
                    .slice(1)
                    .filter(
                      (im) =>
                        !String((im as { mime?: string }).mime || "").startsWith(
                          "video/",
                        ),
                    );

                  return (
                    <HoverSlideshow
                      firstSrc={firstUrl || ""}
                      others={restImageMedias.map((im) => ({
                        src: publicUrl(im.path || ""),
                        alt: im.alt || "",
                      }))}
                      widthPx={Math.ceil(width)}
                      alt={p.tile.cover.alt || ""}
                    />
                  );
                })()}

                {/* overlays in BentoGallery style: top-left user, top-right date, bottom actions */}
                {(() => {
                  const post = idToPost.get(p.tile.id);
                  const profile = post
                    ? authorProfiles.get(post.author_id)
                    : undefined;
                  const dateLabel = post?.created_at
                    ? new Date(post.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                    : "";

                  // Use memoized user object to prevent UserChipHoverCard re-renders
                  const user = memoizedUsers.get(p.tile.id);

                  return (
                    <>
                      {/* top-left user */}
                      {profile && (!username || profileFeedType === "liked") && (
                        <div
                          className="absolute top-2 left-2 sm:top-3 sm:left-3 z-30 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <UserChipHoverCard
                            user={user!}
                            size={"sm"}
                            insideLink
                          />
                        </div>
                      )}

                      {/* top-right date and stats */}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 text-white flex flex-col items-end gap-2">
                        {/* Date */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className="bg-black/50 text-white">
                              <OutlineCalendar />
                              {dateLabel}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            align="center"
                            className="text-xs"
                          >
                            {post?.created_at
                              ? new Date(post.created_at).toLocaleString()
                              : ""}
                          </TooltipContent>
                        </Tooltip>

                        <PostStats stats={post?.stats} animateGate={animateGate} />
                      </div>
                      {/* bottom gradient + actions row */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                      <div className="absolute flex flex-col gap-2 inset-x-0 bottom-0 p-2 sm:p-3 pointer-events-none">
                        {/* Post preview: bottom-anchored, max 3 lines */}
                        {post?.text && (
                          <motion.div
                            className="w-full pointer-events-none transform-gpu [will-change:opacity,transform,filter] md:opacity-0 md:y-8"
                            variants={postVariants}
                            transition={motionTransition}
                          >
                            {/* 3 lines * 1.25rem line-height = 3.75rem */}
                            <div className="min-h-[3.75rem] flex flex-col justify-end">
                              <motion.div
                                className="[will-change:filter] md:blur-0"
                                variants={textVariants}
                                transition={motionTransition}
                              >
                                <TypographyP
                                  className="
                                text-xs text-white leading-[1.25rem]
                                line-clamp-3 text-left
                                [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]
                              "
                                >
                                  {post.text}
                                </TypographyP>
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                        <div className="flex items-center justify-between w-full">
                          <SocialActions
                            postId={p.tile.id}
                            likes={post?.like_count ?? 0}
                            comments={post?.comment_count ?? 0}
                            reposts={post?.repost_count ?? 0}
                            bookmarks={post?.bookmark_count ?? 0}
                            isLiked={post?.is_liked ?? false}
                            isReposted={false}
                            isBookmarked={false}
                            showBookmarksCount={false}
                            animateGate={animateGate}
                            onLike={handleLike}
                            onComment={handleComment}
                            onRepost={handleRepost}
                            onBookmark={handleBookmark}
                          />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.article>
            );
          })}
        </div>

        <div ref={sentinelRef} style={{ height: 1, opacity: 0 }} />

        {/* {loading && (
        <div className="py-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-neutral-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
            Loading more posts...
          </div>
        </div>
      )} */}

        {process.env.NODE_ENV === "development" && (
          <div className="py-2 text-center text-xs text-gray-400">
            Debug: loading={loading.toString()}, hasMore={hasMore.toString()},
            items={items.length}
            <br />
            <Button
              onClick={() => loadMore()}
              className="mt-2"
            >
              Test Load More
            </Button>
          </div>
        )}

        {/* lightweight status */}
        {error && (
          <div className="py-6 text-center text-sm text-red-600">
            Error: {error}
          </div>
        )}
        {!hasMore && !loading && (
          <div className="py-8 text-center text-sm text-neutral-400">
            You&apos;re all caught up.
          </div>
        )}

        {/* Sentinel element for infinite scroll */}
        {hasMore && (
          <div
            ref={sentinelRef}
            className="h-4 w-full"
            aria-hidden="true"
          />
        )}
      </div>
    </TooltipProvider>
  );
});

export default Feed;
