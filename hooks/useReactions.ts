"use client";

import { useCallback, useState } from "react";
import { setBookmark, setLike, setRepost } from "@/app/actions/posts";

export function useReactions(postId: string, userId: string, init?: { liked?: boolean; bookmarked?: boolean; reposted?: boolean }) {
  const [liked, setLiked] = useState(!!init?.liked);
  const [bookmarked, setBookmarked] = useState(!!init?.bookmarked);
  const [reposted, setReposted] = useState(!!init?.reposted);
  const [pending, setPending] = useState<null | "like" | "bookmark" | "repost">(null);

  const toggle = useCallback(async (kind: "like"|"bookmark"|"repost") => {
    setPending(kind);
    try {
      if (kind === "like") {
        const on = !liked; setLiked(on);
        const r = await setLike({ post_id: postId, user_id: userId }, on);
        if (r.error) setLiked(!on);
      } else if (kind === "bookmark") {
        const on = !bookmarked; setBookmarked(on);
        const r = await setBookmark({ post_id: postId, user_id: userId }, on);
        if (r.error) setBookmarked(!on);
      } else {
        const on = !reposted; setReposted(on);
        const r = await setRepost({ post_id: postId, user_id: userId }, on);
        if (r.error) setReposted(!on);
      }
    } finally {
      setPending(null);
    }
  }, [liked, bookmarked, reposted, postId, userId]);

  return { liked, bookmarked, reposted, pending, toggle };
}
