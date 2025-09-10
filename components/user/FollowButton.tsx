"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  isFollowing: boolean;
  loading: boolean;
  canFollow: boolean;
  onToggle: (e?: React.MouseEvent) => void;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
  showText?: boolean;
  disabled?: boolean;
}

export function FollowButton({
  isFollowing,
  loading,
  canFollow,
  onToggle,
  size = "sm",
  variant,
  className,
  showText = true,
  disabled = false,
}: FollowButtonProps) {
  // Don't render if user can't follow (e.g., own profile)
  if (!canFollow) return null;

  // Show skeleton when loading
  if (loading) {
    const skeletonClasses = cn(
      "rounded-full",
      size === "sm" && "h-8 w-16",
      size === "default" && "h-10 w-20",
      size === "lg" && "h-11 w-24",
      className
    );
    return <Skeleton className={skeletonClasses} />;
  }

  // Determine variant based on follow status if not explicitly provided
  const buttonVariant = variant ?? (isFollowing ? "secondary" : "default");

  // Determine text based on follow status
  const buttonText = isFollowing ? "Following" : "Follow";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(e);
  };

  return (
    <Button
      variant={buttonVariant}
      size={size}
      disabled={disabled}
      onClick={handleClick}
      aria-pressed={isFollowing}
      className={cn("rounded-full", className)}
    >
      {showText && (
        <span className="inline-flex items-center gap-1">{buttonText}</span>
      )}
    </Button>
  );
}
