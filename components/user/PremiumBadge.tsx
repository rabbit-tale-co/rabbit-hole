"use client";

import * as React from "react";
import { SolidCarrot } from "../icons/Icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function PremiumBadge({ show, className, label }: { show?: boolean; className?: string; label?: string }) {
  if (!show) return null;
  const text = label || "Golden Carrot — premium";
  const icon = <SolidCarrot className={className || "size-[1.2em] text-amber-600"} />;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span aria-label={text} className="inline-flex items-center align-middle">{icon}</span>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="text-xs">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
