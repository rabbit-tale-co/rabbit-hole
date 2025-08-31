"use client";

import { usePostStats } from "@/hooks/usePostStats";
import { Eye, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PostStatsProps {
  postId: string;
  className?: string;
}

export function PostStats({ postId, className = "" }: PostStatsProps) {
  const { stats, loading } = usePostStats({ postId });

  if (loading || !stats) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className={`flex items-center gap-3 text-xs text-white/80 ${className}`}>
        {/* Total Views */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
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
              <Users className="w-3 h-3" />
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
