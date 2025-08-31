"use client";

import { usePostStats } from "@/hooks/usePostStats";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OutlineEye, OutlineUser } from "../icons/Icons";

interface PostStatsProps {
  postId: string;
  className?: string;
}

export function PostStats({ postId, className = "" }: PostStatsProps) {
  const { stats, loading } = usePostStats({ postId });

  if (loading) {
    return null;
  }

  if (!stats || (stats.views_total === 0 && stats.unique_viewers === 0)) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className={`flex items-center gap-3 text-xs text-white/80 ${className}`}>
        {/* Total Views */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <OutlineEye className="size-3" />
              <span>{stats.views_total.toLocaleString()}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
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
          <TooltipContent side="top" align="center">
            Unique viewers
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
