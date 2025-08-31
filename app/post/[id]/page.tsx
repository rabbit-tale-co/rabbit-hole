"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ImageZoom } from "@/components/ui/kibo-ui/image-zoom";
import Link from "next/link";
import { buildPublicUrl } from "@/lib/publicUrl";
import { PremiumBadge } from "@/components/user/PremiumBadge";
import { useAuth } from "@/providers/AuthProvider";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import Center from "@/components/Center";
import { toast } from "sonner";
import { ConfirmDelete } from "./ConfirmDelete";
// admin state derived from auth profile
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { adminUnbanUser } from "@/app/actions/admin";
import { BanUserDialog } from "./BanUserDialog";
import { OutlineArrowLeft, OutlineCalendar, OutlineMore } from "@/components/icons/Icons";

type Post = {
  id: string;
  author_id: string;
  text: string | null;
  images: { id: string; path: string; alt?: string; width?: number; height?: number }[];
  created_at: string;
};
type Author = { username: string; display_name?: string | null; avatar_url?: string | null; is_premium?: boolean };

export default function PostPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, profile: myProfile } = useAuth();
  const router = useRouter();
  const [post, setPost] = React.useState<Post | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [author, setAuthor] = React.useState<Author | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const isAdmin = Boolean((myProfile as unknown as { is_admin?: boolean } | null)?.is_admin);
  const [banOpen, setBanOpen] = React.useState(false);

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

  // admin derived above

  const publicUrl = React.useCallback((path: string) => buildPublicUrl(path), []);

  const myPost = post && user?.id === post.author_id;

  const copyLink = React.useCallback(async () => {
    try {
      const url = `${window.location.origin}/post/${id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  }, [id]);

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

  // admin delete helper kept for future use in contextual menus

  if (loading) return <Center><div>Loading…</div></Center>;
  if (error || !post) return <Center><div className="text-sm text-muted-foreground">Post not found.</div></Center>;

  return (
    <>
      <div className="mb-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <OutlineArrowLeft className="size-4" />
          Back
        </Button>
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
            <Link href={`/user/${author?.username || post.author_id}`} className="font-semibold hover:underline inline-flex items-center gap-1">
              <span className="truncate">{author?.display_name?.trim() || author?.username || "View author"}</span>
              <PremiumBadge show={Boolean(author?.is_premium ?? (author as unknown as { isPremium?: boolean })?.isPremium)} />
            </Link>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <OutlineCalendar className="size-3" />
              {new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <OutlineMore className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyLink}>Copy link</DropdownMenuItem>
              {myPost && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toast("Edit coming soon")}>Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => setConfirmOpen(true)}>
                    Delete
                  </DropdownMenuItem>
                </>
              )}
              {isAdmin && post && user?.id !== post.author_id && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Admin</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setBanOpen(true)}>Suspend…</DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => {
                    try {
                      const r = await adminUnbanUser(post.author_id);
                      const err = (r as unknown as { error?: string }).error;
                      if (err) { toast.error(err); return; }
                      toast.success("User unbanned");
                    } catch { toast.error("Failed to unban user"); }
                  }}>Unban</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => setConfirmOpen(true)}>Delete post</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isAdmin && post && user?.id !== post.author_id && (
          <BanUserDialog open={banOpen} onOpenChange={setBanOpen} userId={post.author_id} />
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
            <div key={img.id} className="w-full overflow-hidden rounded-xl ring-1 ring-[--border]">
              {isVideo ? (
                <video src={url} controls playsInline preload="metadata" className="w-full h-auto max-h-[80vh] object-contain bg-neutral-50" />
              ) : (
                <ImageZoom>
                  <Image
                    src={url}
                    alt={img.alt || "image"}
                    width={Math.max(1, img.width || 1000)}
                    height={Math.max(1, img.height || 1000)}
                    className="w-full h-auto max-h-[80vh] object-contain bg-neutral-50"
                    sizes="(max-width:768px) 100vw, 768px"
                  />
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
