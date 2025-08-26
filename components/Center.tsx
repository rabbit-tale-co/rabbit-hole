"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function Center({
  children,
  className,
  fullscreen = true,
  offsetTop = "5rem",
}: {
  children: React.ReactNode;
  className?: string;
  fullscreen?: boolean;
  offsetTop?: string;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center place-content-center w-full",
        fullscreen && "min-h-[calc(100vh-var(--offset))]",
        className
      )}
      style={{ ["--offset" as string]: offsetTop }}
    >
      {children}
    </div>
  );
}
