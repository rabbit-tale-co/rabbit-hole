"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useRef, useState, memo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { OutlineEye, OutlineUser } from "../icons/Icons";
import { Badge } from "../ui/badge";

// Stable timing objects to prevent re-renders
const transformTiming = { duration: 400, easing: "ease-out" as const };
const spinTiming = { duration: 300, easing: "ease-out" as const };
const opacityTiming = { duration: 200, easing: "ease-out" as const };

interface PostStatsProps {
  stats?: {
    views_total: number;
    unique_viewers: number;
    last_view_at: string | null;
  };
  className?: string;
  animateGate?: boolean; // bramka z Feed - animuj gdy komponent jest widoczny
}

export const PostStats = memo(function PostStats({ stats, className = "", animateGate = false }: PostStatsProps) {
  console.log("[PostStats] Received stats:", stats);

  // Animation state
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [animateViews, setAnimateViews] = useState(0);
  const [animateViewers, setAnimateViewers] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  // Reset animate values when stats change (only if values actually changed)
  useEffect(() => {
    if (shouldAnimate && stats) {
      const newViews = stats.views_total || 0;
      const newViewers = stats.unique_viewers || 0;

      // Only update if values actually changed to prevent unnecessary re-renders
      if (animateViews !== newViews) {
        setAnimateViews(newViews);
      }
      if (animateViewers !== newViewers) {
        setAnimateViewers(newViewers);
      }
    }
  }, [stats, shouldAnimate, animateViews, animateViewers]);

  // Enable animations only when component is visible in viewport (like SocialActions)
  useEffect(() => {
    if (!animateGate || hasAnimatedRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasAnimatedRef.current = true;
          setShouldAnimate(true);
          // Use requestAnimationFrame instead of setTimeout for better performance
          requestAnimationFrame(() => {
            if (stats) {
              setAnimateViews(stats.views_total || 0);
              setAnimateViewers(stats.unique_viewers || 0);
            }
          });
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [animateGate]); // Removed stats dependency to prevent unnecessary re-creation

  // If no stats provided, show 0 values
  if (!stats) {
    return (
      <Badge className="bg-black/50" ref={containerRef}>
        <div
          className={`flex items-center gap-3 text-xs text-white/90 ${className}`}
        >
          <div className="flex items-center gap-1">
            <OutlineEye size={16} />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <OutlineUser size={16} />
            <span>0</span>
          </div>
        </div>
      </Badge>
    );
  }

  return (
    <Badge className="bg-black/50" ref={containerRef}>
      <div
        className={`flex items-center gap-3 text-xs text-white/90 ${className}`}
      >
        {/* Total Views */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <OutlineEye className="size-4" />
              <span
                className={cn(
                  "transition-opacity",
                  shouldAnimate ? "opacity-100" : "opacity-0",
                )}
              >
                <NumberFlow
                  value={shouldAnimate ? animateViews : 0}
                  className="inline-block"
                  transformTiming={transformTiming}
                  spinTiming={spinTiming}
                  opacityTiming={opacityTiming}
                  animated={shouldAnimate}
                />
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            Total views
          </TooltipContent>
        </Tooltip>

        {/* Unique Viewers */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <OutlineUser className="size-4" />
              <span
                className={cn(
                  "transition-opacity",
                  shouldAnimate ? "opacity-100" : "opacity-0",
                )}
              >
                <NumberFlow
                  value={shouldAnimate ? animateViewers : 0}
                  className="inline-block"
                  transformTiming={transformTiming}
                  spinTiming={spinTiming}
                  opacityTiming={opacityTiming}
                  animated={shouldAnimate}
                />
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            Unique viewers
          </TooltipContent>
        </Tooltip>
      </div>
    </Badge>
  );
});
