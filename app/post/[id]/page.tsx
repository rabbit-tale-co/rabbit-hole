"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ImageZoom } from "@/components/ui/kibo-ui/image-zoom";
import Link from "next/link";
import { CalendarDays, Trash2, Pencil, ArrowLeft } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import Center from "@/components/Center";
import { toast } from "sonner";
import { ConfirmDelete } from "./ConfirmDelete";

type Post = {
  id: string;
  author_id: string;
  text: string | null;
  images: { id: string; path: string; alt?: string; width?: number; height?: number }[];
  created_at: string;
};
type Author = { username: string; display_name?: string | null; avatar_url?: string | null };

export default function PostPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const [post, setPost] = React.useState<Post | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [author, setAuthor] = React.useState<Author | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/posts/${encodeURIComponent(id)}`, { cache: "no-store" });
        const j = await r.json();
        if (!alive) return;
        if (!r.ok) { setError(j?.error || `status_${r.status}`); } else { setPost(j.post as Post); setAuthor(j.author as Author); }
      } catch {
        if (alive) setError("network_error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const publicUrl = React.useCallback((path: string) => (
    /^https?:\/\//.test(path) ? path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/social-art/${path}`
  ), []);

  const myPost = post && user?.id === post.author_id;

  async function handleDelete() {
    if (!post) return;
    try {
      setDeleting(true);
      const r = await fetch(`/api/posts/${post.id}`, { method: "POST", body: JSON.stringify({ _action: "delete" }) });
      if (!r.ok) throw new Error("delete_failed");
      toast.success("Post deleted");
      router.push("/");
    } catch (e: unknown) {
      console.log(e);
      toast.error("Failed to delete post");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  if (loading) return <Center><div>Loading…</div></Center>;
  if (error || !post) return <Center><div className="text-sm text-muted-foreground">Post not found.</div></Center>;

  return (
    <>
      <div className="mb-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2"><ArrowLeft className="size-4" />Back</Button>
      </div>

      {/* header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/user/${author?.username || post.author_id}`} className="flex items-center gap-3">
            <UserAvatar username={author?.username || ""} avatarUrl={author?.avatar_url || undefined}
              className="rounded-md" />
          </Link>
          <div className="min-w-0">
            {/* author chip */}
            <Link href={`/user/${author?.username || post.author_id}`} className="font-semibold hover:underline">
              {author?.display_name?.trim() || author?.username || "View author"}
            </Link>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarDays className="size-3" />
              {new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        </div>
        {myPost && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => toast("Edit coming soon")}> <Pencil className="size-4" /> Edit</Button>
            <Button variant="destructive" size="sm" className="gap-1" onClick={() => setConfirmOpen(true)}> <Trash2 className="size-4" /> Delete</Button>
          </div>
        )}
      </div>

      {/* content */}
      {post.text && <p className="mt-4 whitespace-pre-wrap text-sm">{post.text}</p>}

      {/* media stack */}
      <div className="mt-4 flex flex-col gap-3">
        {post.images?.map((img) => {
          const isVideo = typeof (img as unknown as { mime?: string }).mime === 'string' && (img as unknown as { mime?: string }).mime!.startsWith('video/');
          const url = publicUrl(img.path);
          return (
            <div key={img.id} className="relative w-full overflow-hidden rounded-xl ring-1 ring-[--border]" style={{ aspectRatio: img.width && img.height ? `${img.width}/${img.height}` : undefined }}>
              {isVideo ? (
                <video src={url} controls playsInline preload="metadata" className="w-full h-full object-contain bg-neutral-50" />
              ) : (
                <ImageZoom>
                  <Image src={url} alt={img.alt || "image"} fill className="object-contain bg-neutral-50" sizes="(max-width:768px) 100vw, 768px" />
                </ImageZoom>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDelete open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={handleDelete} loading={deleting} />
    </>
  );
}
