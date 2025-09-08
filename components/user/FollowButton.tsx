"use client";

import { Button } from "@/components/ui/button";
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

  // Determine variant based on follow status if not explicitly provided
  const buttonVariant = variant ?? (isFollowing ? "destructive" : "default");

  // Determine text based on follow status
  const buttonText = isFollowing ? "Unfollow" : "Follow";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(e);
  };

  return (
    <Button
      variant={buttonVariant}
      size={size}
      disabled={loading || disabled}
      onClick={handleClick}
      aria-pressed={isFollowing}
      className={cn("rounded-full", className)}
    >
      {showText && (
        <span className="inline-flex items-center gap-1">
          {buttonText}
        </span>
      )}
    </Button>
  );
}
