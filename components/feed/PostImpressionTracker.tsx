"use client";

import { usePostImpressions } from "@/hooks/usePostImpressions";

interface PostImpressionTrackerProps {
  postId: string;
}

export function PostImpressionTracker({ postId }: PostImpressionTrackerProps) {
  // Hook automatically tracks impressions
  usePostImpressions({ postId, minGapSeconds: 30 });

  return null;
}
