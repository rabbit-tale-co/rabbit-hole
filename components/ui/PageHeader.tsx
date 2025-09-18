"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SolidArrowLeft } from "../icons/Icons";

interface PageHeaderProps {
  title?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  backHref = "/",
  backLabel = "Back",
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn(
      "sticky top-16 z-40",
      className
    )}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-background rounded-full">
          {/* Back Button */}
          <Button variant="ghost" asChild>
            <Link href={backHref}>
              <SolidArrowLeft className="size-4" /> {backLabel}
            </Link>
          </Button>

          {/* Title */}
          {/* <h1 className="text-xl font-semibold">{title}</h1> */}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 p-1 bg-background rounded-full">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
