import NumberFlow from "@number-flow/react";
import React, { useEffect, useRef, useState } from "react";
import { PremiumBadge } from "@/components/premium/PremiumFeature";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FollowDialog } from "./FollowDialog";

interface CustomStat {
  label: string;
  value: number;
}

interface ProfileStatsProps {
  posts: number;
  following: number;
  followers: number;
  targetUserId?: string;
  targetUsername?: string;
  showPremiumBadge?: boolean;
  isOwnProfile?: boolean;
  showAdminStats?: boolean;
  isLoading?: boolean;
  customStats?: CustomStat[];
  onClickPosts?: () => void;
  onClickFollowing?: () => void;
  onClickFollowers?: () => void;
  onClickReplies?: () => void;
  onClickLikes?: () => void;
}

export function ProfileStats({
  posts,
  following,
  followers,
  targetUserId,
  targetUsername,
  isOwnProfile = false,
  showAdminStats = false,
  isLoading = false,
  customStats,
  onClickPosts,
  onClickFollowing,
  onClickFollowers,
  onClickReplies,
  onClickLikes,
}: ProfileStatsProps) {
  const [followDialogOpen, setFollowDialogOpen] = useState(false);

  // Animation state for all counters
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [animatePosts, setAnimatePosts] = useState(0);
  const [animateFollowing, setAnimateFollowing] = useState(0);
  const [animateFollowers, setAnimateFollowers] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  // Set up intersection observer for animation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current && !isLoading) {
          hasAnimatedRef.current = true;
          setShouldAnimate(true);
          setTimeout(() => {
            console.log("Setting all animate values - all data loaded");
            setAnimatePosts(posts || 0);
            setAnimateFollowing(following || 0);
            setAnimateFollowers(followers || 0);
          }, 100);
          obs.disconnect();
        }
      },
      {
        threshold: 0.6,
        rootMargin: "0px",
      },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [posts, following, followers, isLoading]);

  // Reset animation when stats change
  useEffect(() => {
    console.log(
      "ProfileStats stats changed:",
      { posts, following, followers },
      "hasAnimated:",
      hasAnimatedRef.current,
    );
    if (hasAnimatedRef.current) {
      console.log("Updating all animate values");
      setAnimatePosts(posts || 0);
      setAnimateFollowing(following || 0);
      setAnimateFollowers(followers || 0);
    }
  }, [posts, following, followers]);

  const handleFollowersClick = () => {
    if (onClickFollowers) {
      onClickFollowers();
    } else if (targetUserId && targetUsername) {
      setFollowDialogOpen(true);
    }
  };

  const handleFollowingClick = () => {
    if (onClickFollowing) {
      onClickFollowing();
    } else if (targetUserId && targetUsername) {
      setFollowDialogOpen(true);
    }
  };

  // Use custom stats if provided, otherwise use default stats
  const statsToRender = customStats || [
    { label: "Posts", value: posts },
    { label: "Following", value: following },
    { label: "Followers", value: followers },
  ];

  return (
    <>
      <div
        ref={containerRef}
        className="flex justify-center h-8 items-center space-x-1 tabular-nums"
      >
        {statsToRender.map((stat, index) => (
          <React.Fragment key={stat.label}>
            {index > 0 && <Separator orientation="vertical" className="!h-4" />}
            <Button
              variant="ghost"
              size="sm"
              className="font-mono"
              onClick={
                stat.label === "Posts" ? onClickPosts :
                  stat.label === "Following" ? handleFollowingClick :
                    stat.label === "Followers" ? handleFollowersClick :
                      stat.label === "Replies" ? onClickReplies :
                        stat.label === "Likes" ? onClickLikes :
                          undefined
              }
            >
              <h4 className="font-semibold text-neutral-950 dark:text-neutral-50 mr-0.5">
                <NumberFlow
                  value={shouldAnimate ? stat.value : 0}
                  className="inline-block"
                  transformTiming={{ duration: 400, easing: "ease-out" }}
                  spinTiming={{ duration: 300, easing: "ease-out" }}
                  opacityTiming={{ duration: 200, easing: "ease-out" }}
                  animated={shouldAnimate}
                />
              </h4>
              <span className="text-neutral-500 dark:text-neutral-400">
                {stat.label}
              </span>
            </Button>
          </React.Fragment>
        ))}

      </div>

      {targetUserId && targetUsername && (
        <FollowDialog
          open={followDialogOpen}
          onOpenChange={setFollowDialogOpen}
          targetUserId={targetUserId}
          targetUsername={targetUsername}
          followersCount={followers}
          followingCount={following}
        />
      )}
    </>
  );
}
