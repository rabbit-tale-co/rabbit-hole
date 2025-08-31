"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import type { MouseEvent } from "react";
import { useLikeAction } from "@/hooks/useLikeAction";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { OutlineBookmark, OutlineChat, OutlineHeart, OutlineRepeat02, SolidHeart } from "@/components/icons/Icons";

interface SocialActionsProps {
  postId: string; // required so the component can call the API
  likes: number;
  comments: number;
  reposts: number;
  bookmarks: number;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
  onLike: (e: MouseEvent) => void;
  onComment: (e: MouseEvent) => void;
  onRepost: (e: MouseEvent) => void;
  onBookmark: (e: MouseEvent) => void;
  showLikesCount?: boolean;
  showCommentsCount?: boolean;
  showRepostsCount?: boolean;
  showBookmarksCount?: boolean;
  animateGate?: boolean; // bramka z Feed
}

export function SocialActions({
  postId,
  likes,
  comments,
  reposts,
  bookmarks,
  isLiked,
  isReposted,
  isBookmarked,
  onLike,
  onComment,
  onRepost,
  onBookmark,
  showLikesCount = true,
  showCommentsCount = true,
  showRepostsCount = true,
  showBookmarksCount = true,
  animateGate = false
}: SocialActionsProps) {
  const { liked, likesCount, handleLike, updateState } = useLikeAction({
    postId,
    initialLiked: isLiked,
    initialCount: likes,
    onSuccess: () => {
      if (onLike) {
        const fakeEvent = { preventDefault: () => { }, stopPropagation: () => { } } as MouseEvent;
        onLike(fakeEvent);
      }
    }
  });

  // Keep local state in sync if props change
  useEffect(() => { updateState(isLiked, likes); }, [isLiked, likes, updateState]);

  // Enable animations only when component is visible in viewport
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [animateValue, setAnimateValue] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  // Reset animateValue when likes change
  useEffect(() => {
    if (shouldAnimate) {
      setAnimateValue(likes);
    }
  }, [likes, shouldAnimate]);

  // Update animateValue when likesCount changes (from like action)
  useEffect(() => {
    if (shouldAnimate) {
      setAnimateValue(likesCount);
    }
  }, [likesCount, shouldAnimate]);

  useEffect(() => {
    if (!animateGate || hasAnimatedRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasAnimatedRef.current = true;
          setShouldAnimate(true);
          setTimeout(() => {
            setAnimateValue(likesCount);
          }, 100);
          obs.disconnect();
        }
      },
      {
        threshold: 0.6,
        rootMargin: '0px'
      }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [animateGate, likesCount]);



  return (
    <div ref={containerRef} className="flex items-center justify-between text-white">
      <div className="flex items-center gap-3">
        {/* Like button */}
        <div className="flex items-center">
          <div
          >
            <Button
              variant="ghost"
              size={'icon'}
              className={`hover:bg-white/12 hover:text-white ${liked ? 'text-[#f4393e] hover:bg-[#f4393e]/12 drop-shadow-[0_1px_10px_#f4393e]' : 'text-accent drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)]'
                }`}
              onClick={handleLike}
              style={{ transition: 'none' }}
            >
              {liked ? <SolidHeart className="text-[#f4393e]" /> : <OutlineHeart />}
            </Button>
          </div>
          {showLikesCount && (
            <span
              className={cn(
                "ml-1 text-sm transition-opacity",
                liked ? "text-[#f4393e] drop-shadow-[0_1px_1px_rgba(0,0,0,0.75)]" : "text-white",
                likesCount === 0 ? "opacity-0" : (shouldAnimate ? "opacity-100" : "opacity-0")
              )}
            >
              <NumberFlow
                value={animateValue}
                className="inline-block"
                transformTiming={{ duration: 400, easing: 'ease-out' }}
                spinTiming={{ duration: 300, easing: 'ease-out' }}
                opacityTiming={{ duration: 200, easing: 'ease-out' }}
                animated={shouldAnimate}
              />
            </span>
          )}
        </div>

        {/* Comment button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size={'icon'}
            // TODO: add isCommented
            className={`hover:bg-white/12 hover:text-white text-white drop-shadow-[0_0px_2px_rgba(0,0,0,0.75)] $`}
            onClick={onComment}
            style={{ transition: 'none' }}
          >
            <OutlineChat />
          </Button>
          {showCommentsCount && (
            <span
              className={cn(
                "ml-1 text-sm text-white transition-opacity",
                comments === 0 ? "opacity-0" : (shouldAnimate ? "opacity-100" : "opacity-0")
              )}
            >
              <NumberFlow
                value={shouldAnimate ? comments : 0}
                className="inline-block"
                transformTiming={{ duration: 400, easing: 'ease-out' }}
                spinTiming={{ duration: 300, easing: 'ease-out' }}
                opacityTiming={{ duration: 200, easing: 'ease-out' }}
                animated={shouldAnimate}
              />
            </span>
          )}
        </div>

        {/* Repost button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size={'icon'}
            className={`hover:bg-white/12 hover:text-white ${isReposted ? 'text-green-500 hover:text-green-500 hover:bg-green-500/12' : 'text-white drop-shadow-[0_0px_2px_rgba(0,0,0,0.75)]'}`}
            onClick={onRepost}
          >
            <OutlineRepeat02 />
          </Button>
          {showRepostsCount && (
            <span
              className={cn(
                "ml-1 text-sm transition-opacity",
                isReposted ? "text-green-500" : "text-white",
                reposts === 0 ? "opacity-0" : (shouldAnimate ? "opacity-100" : "opacity-0")
              )}
            >
              <NumberFlow
                value={shouldAnimate ? reposts : 0}
                className="inline-block"
                transformTiming={{ duration: 400, easing: 'ease-out' }}
                spinTiming={{ duration: 300, easing: 'ease-out' }}
                opacityTiming={{ duration: 200, easing: 'ease-out' }}
                animated={shouldAnimate}
              />
            </span>
          )}
        </div>
      </div>

      {/* Bookmark button */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size={'icon'}
          className={`hover:bg-white/12 hover:text-white ${isBookmarked ? 'text-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/12' : 'text-white drop-shadow-[0_0px_2px_rgba(0,0,0,0.75)]'}`}
          onClick={onBookmark}
        >
          <OutlineBookmark
            className={cn(isBookmarked ? 'fill-current' : '')}
          />
        </Button>
        {showBookmarksCount && (
          <span
            className={cn(
              "ml-1 text-sm transition-opacity",
              isBookmarked ? "text-yellow-500" : "text-white",
              bookmarks === 0 ? "opacity-0" : (shouldAnimate ? "opacity-100" : "opacity-0")
            )}
          >
            <NumberFlow
              value={shouldAnimate ? bookmarks : 0}
              className="inline-block"
              transformTiming={{ duration: 400, easing: 'ease-out' }}
              spinTiming={{ duration: 300, easing: 'ease-out' }}
              opacityTiming={{ duration: 200, easing: 'ease-out' }}
              animated={shouldAnimate}
            />
          </span>
        )}
      </div>
    </div>
  );
}
