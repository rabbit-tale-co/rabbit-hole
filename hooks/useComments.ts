"use client";

import { useCallback, useState } from "react";
import { addComment, removeComment } from "@/app/actions/posts";

export function useComments(postId: string, authorId: string) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (text: string) => {
    setPending(true); setError(null);
    try {
      const res = await addComment({ post_id: postId, author_id: authorId, text });
      if ("error" in res && res.error) throw new Error(res.error);
      return res.comment;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("comment failed");
      }
      return null;
    } finally { setPending(false); }
  }, [postId, authorId]);

  const del = useCallback(async (comment_id: string) => {
    setPending(true); setError(null);
    try {
      const res = await removeComment({ comment_id, author_id: authorId });
      if ("error" in res && res.error) throw new Error(res.error);
      return true;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("delete failed");
      }
      return false;
    } finally { setPending(false); }
  }, [authorId]);

  return { create, del, pending, error };
}
