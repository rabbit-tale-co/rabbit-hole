import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UseLikeActionProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  onSuccess?: () => void;
  idempotent?: boolean;
}

export function useLikeAction({
  postId,
  initialLiked,
  initialCount,
  onSuccess,
  idempotent = true,
}: UseLikeActionProps) {
  // --- Verified state by the server (source of truth)
  const confirmedLikedRef = useRef(initialLiked);
  const confirmedCountRef = useRef(initialCount);

  // --- Target state (last user request, may "beat" the server)
  const desiredLikedRef = useRef(initialLiked);

  // --- UI (optimistic: shows desired vs confirmed)
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false); // only for animation, DO NOT block the button

  // single-flight gate
  const inFlightRef = useRef(false);

  // recompute UI: confirmed + (desired - confirmed)
  const recomputeUi = useCallback(() => {
    const cLiked = confirmedLikedRef.current;
    const dLiked = desiredLikedRef.current;
    const cCount = confirmedCountRef.current;
    const delta = (dLiked ? 1 : 0) - (cLiked ? 1 : 0); // -1, 0, +1
    setLiked(dLiked);
    setLikesCount(Math.max(0, cCount + delta));
  }, []);

  const updateState = useCallback((newLiked: boolean, newCount: number) => {
    confirmedLikedRef.current = newLiked;
    confirmedCountRef.current = Math.max(0, newCount);
    if (desiredLikedRef.current === confirmedLikedRef.current) {
      desiredLikedRef.current = newLiked;
    }
    recomputeUi();
  }, [recomputeUi]);

  useEffect(() => {
    confirmedLikedRef.current = initialLiked;
    confirmedCountRef.current = initialCount;
    desiredLikedRef.current = initialLiked;
    updateState(initialLiked, initialCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLiked, initialCount]);

  const drain = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsPending(true);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const headers: HeadersInit = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      };

      while (desiredLikedRef.current !== confirmedLikedRef.current) {
        const want = desiredLikedRef.current;

        const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/like`, {
          method: "POST",
          headers,
          body: idempotent ? JSON.stringify({ like: want }) : undefined,
        });
        if (!res.ok) throw new Error("like_failed");

        const json = await res
          .json()
          .catch(() => ({} as { liked?: boolean; like_count?: number }));

        if (typeof json.liked === "boolean" && typeof json.like_count === "number") {
          confirmedLikedRef.current = json.liked;
          confirmedCountRef.current = Math.max(0, json.like_count);
        } else {
          confirmedLikedRef.current = !confirmedLikedRef.current;
          confirmedCountRef.current = Math.max(
            0,
            confirmedCountRef.current + (confirmedLikedRef.current ? +1 : -1)
          );
        }

        recomputeUi();
        onSuccess?.();
      }
    } catch (e: unknown) {
      console.error(e);
      desiredLikedRef.current = confirmedLikedRef.current;
      recomputeUi();
      toast.error("Failed to update like. Please try again.");
    } finally {
      inFlightRef.current = false;
      setIsPending(false);

      if (desiredLikedRef.current !== confirmedLikedRef.current) {
        setTimeout(() => void drain(), 0);
      }
    }
  }, [idempotent, onSuccess, postId, recomputeUi]);

    const handleLike = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newDesiredLiked = !desiredLikedRef.current;

    desiredLikedRef.current = newDesiredLiked;
    recomputeUi();

    void drain();
  }, [drain, recomputeUi]);

  const cleanup = useCallback(() => {
  }, []);

  return { liked, likesCount, isPending, handleLike, updateState, cleanup };
}
