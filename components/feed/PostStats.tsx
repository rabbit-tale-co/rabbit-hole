"use client";

import { usePostStats } from "@/hooks/usePostStats";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OutlineEye, OutlineUser } from "../icons/Icons";

interface PostStatsProps {
  postId: string;
  className?: string;
}

export function PostStats({ postId, className = "" }: PostStatsProps) {
  const { stats, loading, error } = usePostStats({ postId });

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-xs text-white/90 ${className}`}>
        <div className="flex items-center gap-1">
          <OutlineEye className="size-3" />
          <span>...</span>
        </div>
      </div>
    );
  }

  // If there's an error (like table doesn't exist), show 0 stats instead of hiding
  if (error || !stats) {
    return (
      <div className={`flex items-center gap-2 text-xs text-white/90 ${className}`}>
        <div className="flex items-center gap-1">
          <OutlineEye className="size-3" />
          <span>0</span>
        </div>
      </div>
    );
  }

  // Only show stats if we have actual data
  if (stats.views_total === 0 && stats.unique_viewers === 0) {
    return (
      <div className={`flex items-center gap-2 text-xs text-white/90 ${className}`}>
        <div className="flex items-center gap-1">
          <OutlineEye className="size-3" />
          <span>0</span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className={`flex items-center gap-2 text-xs text-white/90 ${className}`}>
        {/* Total Views */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <OutlineEye className="size-3" />
              <span>{stats.views_total.toLocaleString()}</span>
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
              <OutlineUser className="size-3" />
              <span>{stats.unique_viewers.toLocaleString()}</span>
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
