// app/api/posts/route.ts
import { NextRequest } from "next/server";
import { CreatePost, Cursor } from "@/lib/validation";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUser } from "@/lib/auth";
import { getFeedPage, getUserFeedPage } from "@/app/actions/posts";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = Cursor.safeParse({
    cursor: searchParams.get("cursor") ?? undefined,
    limit: Number(searchParams.get("limit") ?? "24"),
  });
  if (!parsed.success) return Response.json({ error: "bad cursor" }, { status: 400 });

  const user = await getUser();
  const { cursor, limit } = parsed.data;

  const userIdParam = searchParams.get("userId");

  if (userIdParam) {
    const uid = z.uuid().safeParse(userIdParam);
    if (!uid.success) return Response.json({ error: "bad userId" }, { status: 400 });

    // Use getUserFeedPage for user-specific feeds
    const result = await getUserFeedPage({ cursor, limit, author_id: userIdParam });
    if (result.error) return Response.json({ error: result.error }, { status: 400 });
    return Response.json(result);
  }

  // Use getFeedPage for main feed (includes stats)
  const result = await getFeedPage({ cursor, limit });
  if (result.error) return Response.json({ error: result.error }, { status: 400 });

  // Attach current-user like flags for returned page only
  if (user && result.items && result.items.length > 0) {
    try {
      const postIds = result.items.map(p => p.id);
      const { data: likes } = await supabaseAdmin
        .from("likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds);
      const liked = new Set((likes || []).map(l => l.post_id));
      result.items = result.items.map(p => ({ ...p, is_liked: liked.has(p.id) }));
    } catch {}
  }

  return Response.json(result);
}

export async function POST(req: NextRequest) {
  // verify Supabase session JWT from cookies
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const parsed = await CreatePost.safeParseAsync(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 });

  const { images, text } = parsed.data;

  // Log JWT usage for post creation
  console.log(`[JWT] Create post requested by user: ${user.id}`);
  console.log(`[JWT] Post content: ${text ? `"${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"` : 'no text'}`);
  console.log(`[JWT] Post images count: ${images?.length || 0}`);

  // Insert post
  const { data, error } = await supabaseAdmin
    .from("posts")
    .insert({
      author_id: user.id,
      text: text ?? null,
      images,
    })
    .select()
    .single();

  if (error) {
    console.log(`[JWT] Create post failed: ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }

  console.log(`[JWT] Post created successfully: ${data.id}`);

  return Response.json({ post: data }, { status: 201 });
}
