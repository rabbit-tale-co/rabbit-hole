"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserFromCookies, isBanned } from "@/lib/auth";
import { CreatePost, UpdatePost, PostIdUserId, CommentCreate, CommentDelete, FeedCursor } from "@/schemas/post";
import { UUID } from "@/schemas/_shared";
import { z } from "zod";
// using central schemas from '@/schemas/post'


// --- helpers ---
function decodeCursor(cursor?: string | null) {
  if (!cursor) return null;
  try {
    const [ts, id] = Buffer.from(cursor, "base64").toString("utf8").split("|");
    return { ts, id };
  } catch { return null; }
}
function encodeCursor(ts: string, id: string) {
  return Buffer.from(`${ts}|${id}`).toString("base64");
}

// Require logged-in and not-banned user. Optionally assert the userId matches the current user.
async function requireActiveUser(expectedUserId?: string): Promise<{ error?: string; me?: { id: string } }> {
  const me = await getUserFromCookies();
  if (!me) return { error: "Unauthorized" };
  if (isBanned(me.bannedUntil)) return { error: "Banned" };
  if (expectedUserId && me.id !== expectedUserId) return { error: "Forbidden" };
  return { me: { id: me.id } };
}

// --- create post (images must be already uploaded to Storage with those paths) ---
export async function createPost(input: unknown) {
  const parsed = CreatePost.safeParse(input);
  if (!parsed.success) return { error: "Invalid payload" };

  {
    const auth = await requireActiveUser(parsed.data.author_id);
    if (auth.error) return { error: auth.error };
  }

  const sb = supabaseAdmin;
  const { data, error } = await sb
    .from("posts")
    .insert({
      author_id: parsed.data.author_id,
      text: parsed.data.text ?? null,
      images: parsed.data.images,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { post: data };
}

// --- update post (replace text and/or images atomically) ---
export async function updatePost(input: unknown) {
  const parsed = UpdatePost.safeParse(input);
  if (!parsed.success) return { error: "Invalid payload" };

  {
    const auth = await requireActiveUser(parsed.data.author_id);
    if (auth.error) return { error: auth.error };
  }

  const sb = supabaseAdmin;
  const { data: post, error: fetchErr } = await sb
    .from("posts")
    .select("author_id, images")
    .eq("id", parsed.data.post_id)
    .single();
  if (fetchErr) return { error: fetchErr.message };
  if (post.author_id !== parsed.data.author_id) return { error: "Forbidden" };

  const patch: Record<string, unknown> = {};
  if (parsed.data.text !== undefined) patch.text = parsed.data.text;
  if (parsed.data.images) patch.images = parsed.data.images;

  const { data, error } = await sb
    .from("posts")
    .update(patch)
    .eq("id", parsed.data.post_id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { post: data };
}

// --- delete post (soft delete + return paths for caller to purge if needed) ---
export async function deletePost(post_id: string, author_id: string) {
  {
    const auth = await requireActiveUser(author_id);
    if (auth.error) return { error: auth.error };
  }
  const sb = supabaseAdmin;
  const { data: post, error: getErr } = await sb
    .from("posts")
    .select("author_id, images, is_deleted")
    .eq("id", post_id)
    .single();
  if (getErr) return { error: getErr.message };
  if (post.author_id !== author_id) return { error: "Forbidden" };
  if (post.is_deleted) return { ok: true, already: true, images: post.images ?? [] };

  const { error } = await sb
    .from("posts")
    .update({ is_deleted: true })
    .eq("id", post_id);
  if (error) return { error: error.message };
  return { ok: true, images: post.images ?? [] };
}

// --- ADMIN ONLY: delete any post by id ---
export async function adminDeletePost(post_id: string) {
  const me = await getUserFromCookies();
  if (!me || (!me.isSuperAdmin && !me.roles.includes("admin"))) return { error: "Forbidden" };
  if (isBanned(me.bannedUntil)) return { error: "Banned" };
  const { error } = await supabaseAdmin.from("posts").update({ is_deleted: true }).eq("id", post_id);
  if (error) return { error: error.message };
  return { ok: true };
}

// --- ADMIN ONLY: delete all posts (TEMP DEV TOOL) ---
export async function adminDeleteAllPosts() {
  const me = await getUserFromCookies();
  if (!me || (!me.isSuperAdmin && !me.roles.includes("admin"))) return { error: "Forbidden" };
  if (isBanned(me.bannedUntil)) return { error: "Banned" };
  const { error } = await supabaseAdmin.from("posts").update({ is_deleted: true }).neq("id", "");
  if (error) return { error: error.message };
  return { ok: true };
}

// --- like / bookmark / repost (idempotent toggle) ---
async function toggle(table: "likes" | "bookmarks" | "reposts", post_id: string, user_id: string, on: boolean) {
  const sb = supabaseAdmin;
  if (on) {
    const { error } = await sb.from(`${table}`).upsert({ post_id, user_id });
    if (error) return { error: error.message };
    return { ok: true, on: true };
  } else {
    const { error } = await sb.from(`${table}`).delete().eq("post_id", post_id).eq("user_id", user_id);
    if (error) return { error: error.message };
    return { ok: true, on: false };
  }
}

export async function setLike(input: unknown, on: boolean) {
  const parsed = PostIdUserId.safeParse(input);
  if (!parsed.success) return { error: "Invalid payload" };
  {
    const auth = await requireActiveUser(parsed.data.user_id);
    if (auth.error) return { error: auth.error };
  }
  return toggle("likes", parsed.data.post_id, parsed.data.user_id, on);
}
export async function setBookmark(input: unknown, on: boolean) {
  const parsed = PostIdUserId.safeParse(input);
  if (!parsed.success) return { error: "Invalid payload" };
  {
    const auth = await requireActiveUser(parsed.data.user_id);
    if (auth.error) return { error: auth.error };
  }
  return toggle("bookmarks", parsed.data.post_id, parsed.data.user_id, on);
}
export async function setRepost(input: unknown, on: boolean) {
  const parsed = PostIdUserId.safeParse(input);
  if (!parsed.success) return { error: "Invalid payload" };
  {
    const auth = await requireActiveUser(parsed.data.user_id);
    if (auth.error) return { error: auth.error };
  }
  return toggle("reposts", parsed.data.post_id, parsed.data.user_id, on);
}

// --- comments ---
export async function addComment(input: unknown) {
  const parsed = CommentCreate.safeParse(input);
  if (!parsed.success) return { error: "Invalid payload" };
  {
    const auth = await requireActiveUser(parsed.data.author_id);
    if (auth.error) return { error: auth.error };
  }
  const sb = supabaseAdmin;
  const { data, error } = await sb.from("comments").insert(parsed.data).select().single();
  if (error) return { error: error.message };
  return { comment: data };
}
export async function removeComment(input: unknown) {
  const parsed = CommentDelete.safeParse(input);
  if (!parsed.success) return { error: "Invalid payload" };
  {
    const auth = await requireActiveUser(parsed.data.author_id);
    if (auth.error) return { error: auth.error };
  }
  const sb = supabaseAdmin;
  // authorize: author only
  const { data: c, error: e1 } = await sb.from("comments").select("author_id").eq("id", parsed.data.comment_id).single();
  if (e1) return { error: e1.message };
  if (c.author_id !== parsed.data.author_id) return { error: "Forbidden" };
  const { error } = await sb.from("comments").update({ is_deleted: true }).eq("id", parsed.data.comment_id);
  if (error) return { error: error.message };
  return { ok: true };
}

// --- feed page ---
export async function getFeedPage(input: unknown) {
  const parsed = FeedCursor.safeParse(input);
  if (!parsed.success) return { error: "Invalid cursor" };

  const sb = supabaseAdmin;
  const decoded = decodeCursor(parsed.data.cursor);
  const query = sb
    .from("posts")
    .select("*")
    .or("is_deleted.is.null,is_deleted.eq.false")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(parsed.data.limit);

  if (decoded) {
    // simple keyset without tie-break OR to avoid overriding previous OR filters
    query.lt("created_at", decoded.ts);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };

  const nextCursor =
    data && data.length
      ? encodeCursor(data[data.length - 1].created_at as string, data[data.length - 1].id as string)
      : null;

  return { items: data ?? [], nextCursor };
}

// --- feed page filtered by author ---
const FeedByAuthor = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(24),
  author_id: UUID,
});

export async function getUserFeedPage(input: unknown) {
  const parsed = FeedByAuthor.safeParse(input);
  if (!parsed.success) return { error: "Invalid cursor or author_id" };

  const sb = supabaseAdmin;
  const decoded = decodeCursor(parsed.data.cursor);
  const query = sb
    .from("posts")
    .select("*")
    .or("is_deleted.is.null,is_deleted.eq.false")
    .eq("author_id", parsed.data.author_id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(parsed.data.limit);

  if (decoded) {
    // simple keyset without tie-break OR to avoid overriding filters
    query.lt("created_at", decoded.ts);
  }

  const { data, error } = await query;
  if (error) return { error: error.message};

  const nextCursor =
    data && data.length
      ? encodeCursor(data[data.length - 1].created_at as string, data[data.length - 1].id as string)
      : null;

  return { items: data ?? [], nextCursor };
}
