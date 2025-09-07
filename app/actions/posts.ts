"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { CreatePost, UpdatePost, PostIdUserId, CommentCreate, CommentDelete, FeedCursor } from "@/schemas/post";
import { UUID } from "@/schemas/_shared";
import { z } from "zod";
import { revalidatePath } from "next/cache";
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
  // Try to get user from Supabase session first
  const { data: auth } = await supabaseAdmin.auth.getUser();

  if (!auth.user?.id) {
    // If no session, try to get user from client-side context
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return { error: "Unauthorized" };

      // Log JWT usage for critical operations
      console.log(`[JWT] User authenticated (client): ${user.id}${expectedUserId ? ` (expected: ${expectedUserId})` : ''}`);

      if (expectedUserId && user.id !== expectedUserId) return { error: "Forbidden" };
      return { me: { id: user.id } };
    } catch (error) {
      console.error('[JWT] Auth error:', error);
      return { error: "Unauthorized" };
    }
  }

  // Log JWT usage for critical operations
  console.log(`[JWT] User authenticated (server): ${auth.user.id}${expectedUserId ? ` (expected: ${expectedUserId})` : ''}`);

  // Note: bannedUntil check moved to admin functions in admin.ts
  if (expectedUserId && auth.user.id !== expectedUserId) return { error: "Forbidden" };
  return { me: { id: auth.user.id } };
}

// --- create post (images must be already uploaded to Storage with those paths) ---
export async function createPost(input: unknown) {
  console.log(`[JWT] CreatePost function called with input:`, input);

  const parsed = CreatePost.safeParse(input);
  if (!parsed.success) {
    console.log(`[JWT] CreatePost validation failed:`, parsed.error);
    return { error: "Invalid payload" };
  }

  // Log JWT usage for post creation
  console.log(`[JWT] Create post requested by user: ${parsed.data.author_id}`);

  {
    console.log(`[JWT] Calling requireActiveUser for user: ${parsed.data.author_id}`);
    const auth = await requireActiveUser(parsed.data.author_id);
    console.log(`[JWT] requireActiveUser result:`, auth);
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

  // Revalidate the feed pages to show the new post
  // Don't revalidate main page to avoid infinite loops
  // revalidatePath('/');
  revalidatePath(`/user/${parsed.data.author_id}`);

  return { post: data };
}

// --- update post (replace text and/or images atomically) ---
export async function updatePost(input: unknown) {
  const parsed = UpdatePost.safeParse(input);
  if (!parsed.success) return { error: "Invalid payload" };

  // Log JWT usage for post update
  console.log(`[JWT] Update post requested: ${parsed.data.post_id} by user: ${parsed.data.author_id}`);

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

  // Revalidate the feed pages to show the new post
  // Don't revalidate main page to avoid infinite loops
  // revalidatePath('/');
  revalidatePath(`/user/${parsed.data.author_id}`);

  return { post: data };
}

// --- delete post (soft delete + return paths for caller to purge if needed) ---
export async function deletePost(post_id: string, author_id: string) {
  // Log JWT usage for post deletion
  console.log(`[JWT] Delete post requested: ${post_id} by user: ${author_id}`);
  console.log(`[JWT] Delete post - author_id type: ${typeof author_id}, value: ${JSON.stringify(author_id)}`);

  // Note: Authorization is already verified by the caller (API endpoint)
  // We just need to verify that the user can delete this specific post
  const sb = supabaseAdmin;
  const { data: post, error: getErr } = await sb
    .from("posts")
    .select("author_id, images, is_deleted")
    .eq("id", post_id)
    .single();
  if (getErr) return { error: getErr.message };

  // Verify that the authenticated user is the author of the post
  if (post.author_id !== author_id) {
    console.log(`[JWT] Delete post - Forbidden: user ${author_id} cannot delete post by ${post.author_id}`);
    return { error: "Forbidden" };
  }

  if (post.is_deleted) return { ok: true, already: true, images: post.images ?? [] };

  const { error } = await sb
    .from("posts")
    .update({ is_deleted: true })
    .eq("id", post_id);
  if (error) return { error: error.message };
  return { ok: true, images: post.images ?? [] };
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

  // Log JWT usage for like operation
  console.log(`[JWT] Like ${on ? 'added' : 'removed'} for post: ${parsed.data.post_id} by user: ${parsed.data.user_id}`);

  {
    const auth = await requireActiveUser(parsed.data.user_id);
    if (auth.error) return { error: auth.error };
  }
  return toggle("likes", parsed.data.post_id, parsed.data.user_id, on);
}
export async function setBookmark(input: unknown, on: boolean) {
  const parsed = PostIdUserId.safeParse(input);
  if (!parsed.success) return { error: "Invalid payload" };

  // Log JWT usage for bookmark operation
  console.log(`[JWT] Bookmark ${on ? 'added' : 'removed'} for post: ${parsed.data.post_id} by user: ${parsed.data.user_id}`);

  {
    const auth = await requireActiveUser(parsed.data.user_id);
    if (auth.error) return { error: auth.error };
  }
  return toggle("bookmarks", parsed.data.post_id, parsed.data.user_id, on);
}
export async function setRepost(input: unknown, on: boolean) {
  const parsed = PostIdUserId.safeParse(input);
  if (!parsed.success) return { error: "Invalid payload" };

  // Log JWT usage for repost operation
  console.log(`[JWT] Repost ${on ? 'added' : 'removed'} for post: ${parsed.data.post_id} by user: ${parsed.data.user_id}`);

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

  // Log JWT usage for comment creation
  console.log(`[JWT] Comment added to post: ${parsed.data.post_id} by user: ${parsed.data.author_id}`);

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

  // Log JWT usage for comment deletion
  console.log(`[JWT] Comment removed: ${parsed.data.comment_id} by user: ${parsed.data.author_id}`);

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

  // Fetch real post stats for all posts in batch
  let itemsWithStats = data ?? [];

  if (data && data.length > 0) {
    try {
      const postIds = data.map(post => post.id);
      // console.log('Fetching real stats for posts:', postIds.length);

      const { data: statsData, error: statsError } = await sb
        .from('posts_stats')
        .select('post_id, views_total, unique_viewers, last_view_at')
        .in('post_id', postIds);

      if (statsError) {
        console.error('Failed to fetch post stats:', statsError);
        // If stats table doesn't exist, return posts without stats
        console.log('Stats table not available, returning posts without stats');
        itemsWithStats = data.map(post => ({
          ...post,
          stats: {
            views_total: 0,
            unique_viewers: 0,
            last_view_at: null
          }
        }));
      } else {
        // Create a map of post_id to stats for efficient lookup
        const statsMap = new Map();
        (statsData ?? []).forEach(stat => {
          statsMap.set(stat.post_id, {
            views_total: stat.views_total || 0,
            unique_viewers: stat.unique_viewers || 0,
            last_view_at: stat.last_view_at
          });
        });

        // Attach stats to each post
        itemsWithStats = data.map(post => {
          const stats = statsMap.get(post.id) || {
            views_total: 0,
            unique_viewers: 0,
            last_view_at: null
          };
          // console.log(`Post ${post.id} real stats:`, stats);
          return {
            ...post,
            stats
          };
        });
      }
    } catch (err) {
      console.error('Error fetching post stats:', err);
      // Return posts without stats if there's an error
      itemsWithStats = data.map(post => ({
        ...post,
        stats: {
          views_total: 0,
          unique_viewers: 0,
          last_view_at: null
        }
      }));
    }
  }

  const nextCursor =
    data && data.length
      ? encodeCursor(data[data.length - 1].created_at as string, data[data.length - 1].id as string)
      : null;

  // console.log('Returning items with real stats, first item stats:', itemsWithStats[0]?.stats);
  return { items: itemsWithStats, nextCursor };
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

// --- get post stats ---
export async function getPostStats(postId: string) {
  const sb = supabaseAdmin;

  try {
    const { data, error } = await sb
      .from('posts_stats')
      .select('views_total, unique_viewers, last_view_at')
      .eq('post_id', postId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - post doesn't have stats yet
        return {
          stats: { views_total: 0, unique_viewers: 0, last_view_at: null }
        };
      }
      return { error: error.message };
    }

    return { stats: data };
  } catch (err) {
    console.error('Failed to fetch post stats:', err);
    return { error: 'Failed to fetch stats' };
  }
}

// --- track post view ---
export async function trackPostView(postId: string, userId?: string) {
  const sb = supabaseAdmin;

  try {
    // First, try to get existing stats
    const { data: existingStats } = await sb
      .from('posts_stats')
      .select('views_total, unique_viewers')
      .eq('post_id', postId)
      .single();

    if (existingStats) {
      // Update existing stats
      const { error } = await sb
        .from('posts_stats')
        .update({
          views_total: existingStats.views_total + 1,
          unique_viewers: userId ? existingStats.unique_viewers + 1 : existingStats.unique_viewers,
          last_view_at: new Date().toISOString()
        })
        .eq('post_id', postId);

      if (error) {
        console.error('Failed to update post stats:', error);
        return { error: error.message };
      }
    } else {
      // Create new stats record
      const { error } = await sb
        .from('posts_stats')
        .insert({
          post_id: postId,
          views_total: 1,
          unique_viewers: userId ? 1 : 0,
          last_view_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to create post stats:', error);
        return { error: error.message };
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to track post view:', err);
    return { error: 'Failed to track view' };
  }
}
