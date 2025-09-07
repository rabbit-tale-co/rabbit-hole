"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OutlineEye, OutlineUser } from "../icons/Icons";
import { useEffect, useState, useRef } from "react";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

interface PostStatsProps {
  stats?: {
    views_total: number;
    unique_viewers: number;
    last_view_at: string | null;
  };
  className?: string;
}

export function PostStats({ stats, className = "" }: PostStatsProps) {

  // Animation state
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [animateViews, setAnimateViews] = useState(0);
  const [animateViewers, setAnimateViewers] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  // Start animation when stats are available
  useEffect(() => {
    if (!stats || hasAnimatedRef.current) return;

    hasAnimatedRef.current = true;
    setShouldAnimate(true);
    setTimeout(() => {
      setAnimateViews(stats.views_total || 0);
      setAnimateViewers(stats.unique_viewers || 0);
    }, 100);
  }, [stats]);

  // If no stats provided, show 0 values
  if (!stats) {
    return (
      <div className={`flex items-center gap-3 text-xs text-white/90 ${className}`}>
        <div className="flex items-center gap-1">
          <OutlineEye size={16} />
          <span>0</span>
        </div>
        <div className="flex items-center gap-1">
          <OutlineUser size={16} />
          <span>0</span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div ref={containerRef} className={`flex items-center gap-3 text-xs text-white/90 ${className}`}>
        {/* Total Views */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <OutlineEye className="size-4" />
              <span className={cn(
                "transition-opacity",
                shouldAnimate ? "opacity-100" : "opacity-0"
              )}>
                <NumberFlow
                  value={shouldAnimate ? animateViews : 0}
                  className="inline-block"
                  transformTiming={{ duration: 400, easing: 'ease-out' }}
                  spinTiming={{ duration: 300, easing: 'ease-out' }}
                  opacityTiming={{ duration: 200, easing: 'ease-out' }}
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
              <span className={cn(
                "transition-opacity",
                shouldAnimate ? "opacity-100" : "opacity-0"
              )}>
                <NumberFlow
                  value={shouldAnimate ? animateViewers : 0}
                  className="inline-block"
                  transformTiming={{ duration: 400, easing: 'ease-out' }}
                  spinTiming={{ duration: 300, easing: 'ease-out' }}
                  opacityTiming={{ duration: 200, easing: 'ease-out' }}
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
    </TooltipProvider>
  );
}
