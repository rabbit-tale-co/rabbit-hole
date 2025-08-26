"use client";

import { useCallback, useMemo, useState } from "react";
import { createPost, updatePost, deletePost } from "@/app/actions/posts";
import { presignPostImageUpload } from "@/app/actions/storage";
import type { ImageMetaRow } from "@/types/db";

type FileLike = File & { mime?: string };

export function usePostComposer(authorId: string) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadOne = useCallback(async (postId: string, file: FileLike) => {
    const ext = (file.type.split("/")[1] || "jpg").replace("jpeg","jpg") as "jpg"|"png"|"webp";
    const presign = await presignPostImageUpload(postId, ext, authorId);
    if (presign.error || !presign.data) throw new Error(presign.error || "presign failed");
    const { url, path, imageId } = presign.data;

    const r = await fetch(url, {
      method: "PUT",
      headers: { "content-type": file.type },
      body: file,
    });
    if (!r.ok) throw new Error("upload failed");

    return { id: imageId, path, alt: "", width: 0, height: 0, size_bytes: file.size, mime: file.type };
  }, [authorId]);

  const create = useCallback(async (caption: string | undefined, files: FileLike[]) => {
    setBusy(true); setError(null);
    try {
      const postId = crypto.randomUUID();
      const metas = [];
      for (const f of files) {
        metas.push(await uploadOne(postId, f));
      }
      const res = await createPost({ author_id: authorId, text: caption, images: metas });
      if ("error" in res && res.error) throw new Error(res.error);
      return res.post;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("create failed");
      }
      return null;
    } finally { setBusy(false); }
  }, [authorId, uploadOne]);

  const edit = useCallback(async (post_id: string, caption?: string, images?: ImageMetaRow[]) => {
    setBusy(true); setError(null);
    try {
      const res = await updatePost({ post_id, author_id: authorId, text: caption, images });
      if ("error" in res && res.error) throw new Error(res.error);
      return res.post;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("update failed");
      }
      return null;
    } finally { setBusy(false); }
  }, [authorId]);

  const remove = useCallback(async (post_id: string) => {
    setBusy(true); setError(null);
    try {
      const res = await deletePost(post_id, authorId);
      if ("error" in res && res.error) throw new Error(res.error);
      // optional: iterate res.images and delete from storage if you decide to purge instantly
      return true;
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("delete failed");
      }
      return false;
    } finally { setBusy(false); }
  }, [authorId]);

  return { busy, error, create, edit, remove };
}
