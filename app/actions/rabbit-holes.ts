"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { CreateRabbitHole } from "@/schemas/rabbit-hole";
import { requireActiveUser } from "@/app/actions/auth";
import { encodeCursor } from "@/lib/cursor-utils";

export async function createRabbitHole(input: unknown) {
  const auth = await requireActiveUser();
  if (auth.error || !auth.me) {
    return { error: auth.error || "Unauthorized" };
  }
  const parsed = CreateRabbitHole.parse(input);

  // Check if name already exists
  const { data: existing } = await supabaseAdmin
    .from("rabbit_holes")
    .select("id")
    .eq("name", parsed.name)
    .single();

  if (existing) {
    return { error: "Rabbit hole name already exists" };
  }

  const { data, error } = await supabaseAdmin
    .from("rabbit_holes")
    .insert({
      ...parsed,
      created_by: auth.me.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating rabbit hole:", error);
    return { error: error.message };
  }

  return { data };
}

export async function getRabbitHoleByUrl(url: string) {
  const { data, error } = await supabaseAdmin
    .from("rabbit_holes")
    .select(`
      id,
      name,
      url,
      description,
      rules,
      avatar_url,
      cover_url,
      owner_id,
      member_count,
      post_count,
      like_count,
      accent_color,
      created_at,
      updated_at,
      is_public
    `)
    .eq("url", url)
    .eq("is_public", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { data: null };
    }
    console.error("Error fetching rabbit hole:", error);
    return { error: error.message };
  }

  return { data };
}

export async function getRabbitHoleFeedPage(input: {
  rabbit_hole_id: string;
  take: number;
  skip?: number;
  cursorId?: string;
  cursorCreatedAt?: string;
  user_id?: string; // for checking is_liked
}) {
  const { rabbit_hole_id, take, skip = 0, cursorId, cursorCreatedAt, user_id } = input;

  // Get posts from this rabbit hole
  let query = supabaseAdmin
    .from("posts")
    .select("*")
    .eq("rabbit_hole_id", rabbit_hole_id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(take + 1);

  // Apply cursor-based pagination
  if (cursorId && cursorCreatedAt) {
    query = query.or(`created_at.lt.${cursorCreatedAt},and(created_at.eq.${cursorCreatedAt},id.lt.${cursorId})`);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error("Error fetching rabbit hole feed:", error);
    return { error: error.message };
  }

  const hasMore = posts.length > take;
  const items = hasMore ? posts.slice(0, -1) : posts;

  // Get next cursor info
  const nextId = hasMore && items.length > 0 ? items[items.length - 1].id : null;
  const nextCreatedAt = hasMore && items.length > 0 ? items[items.length - 1].created_at : null;
  const nextCursor = hasMore ? encodeCursor(nextCreatedAt as string, nextId as string) : null;

  // Get reaction counts
  const postIds = items.map(p => p.id);
  const { data: likes } = await supabaseAdmin
    .from("likes")
    .select("post_id")
    .in("post_id", postIds);

  const { data: bookmarks } = await supabaseAdmin
    .from("bookmarks")
    .select("post_id")
    .in("post_id", postIds);

  const { data: reposts } = await supabaseAdmin
    .from("reposts")
    .select("post_id")
    .in("post_id", postIds);

  const { data: comments } = await supabaseAdmin
    .from("comments")
    .select("post_id")
    .in("post_id", postIds);

  // Get user's likes if user_id is provided
  let userLikes: string[] = [];
  if (input.user_id) {
    const { data: userLikesData } = await supabaseAdmin
      .from("likes")
      .select("post_id")
      .eq("user_id", input.user_id)
      .in("post_id", postIds);
    userLikes = (userLikesData || []).map(like => like.post_id);
  }

  // Get post stats
  const { data: stats } = await supabaseAdmin
    .from("posts_stats")
    .select("post_id, views, unique_viewers")
    .in("post_id", postIds);

  // Merge data
  const itemsWithCounts = items.map(post => {
    const likesCount = likes?.filter(l => l.post_id === post.id).length || 0;
    const bookmarksCount = bookmarks?.filter(b => b.post_id === post.id).length || 0;
    const repostsCount = reposts?.filter(r => r.post_id === post.id).length || 0;
    const commentsCount = comments?.filter(c => c.post_id === post.id).length || 0;
    const postStats = stats?.find(s => s.post_id === post.id);

    return {
      ...post,
      likes_count: likesCount,
      bookmarks_count: bookmarksCount,
      reposts_count: repostsCount,
      comments_count: commentsCount,
      views: postStats?.views || 0,
      unique_viewers: postStats?.unique_viewers || 0,
      is_liked: userLikes.includes(post.id),
    };
  });

  return {
    items: itemsWithCounts,
    nextCursor,
    nextId,
    nextCreatedAt,
  };
}

export async function joinRabbitHole(rabbit_hole_id: string) {
  const auth = await requireActiveUser();
  if (auth.error || !auth.me) {
    return { error: auth.error || "Unauthorized" };
  }

  const { error } = await supabaseAdmin
    .from("rabbit_hole_members")
    .insert({
      rabbit_hole_id,
      user_id: auth.me.id,
    });

  if (error) {
    console.error("Error joining rabbit hole:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function leaveRabbitHole(rabbit_hole_id: string) {
  const auth = await requireActiveUser();
  if (auth.error || !auth.me) {
    return { error: auth.error || "Unauthorized" };
  }

  const { error } = await supabaseAdmin
    .from("rabbit_hole_members")
    .delete()
    .eq("rabbit_hole_id", rabbit_hole_id)
    .eq("user_id", auth.me.id);

  if (error) {
    console.error("Error leaving rabbit hole:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function isMemberOfRabbitHole(rabbit_hole_id: string, user_id: string) {
  const { data, error } = await supabaseAdmin
    .from("rabbit_hole_members")
    .select("id")
    .eq("rabbit_hole_id", rabbit_hole_id)
    .eq("user_id", user_id)
    .single();

  if (error) {
    return { isMember: false };
  }

  return { isMember: !!data };
}
