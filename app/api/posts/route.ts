// app/api/posts/route.ts
import { NextRequest } from "next/server";
import { CreatePost, Cursor } from "@/lib/validation";
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

  const usernameParam = searchParams.get("username");

  if (usernameParam) {
    // Validate username format
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    if (!usernameRegex.test(usernameParam)) {
      return Response.json({ error: "Invalid username format" }, { status: 400 });
    }

    // First get user_id from username
    const { data: profile, error: profileError } = await supabaseAdmin
      .schema('social_art')
      .from("profiles")
      .select("user_id")
      .eq("username", usernameParam)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return Response.json({ error: "Database error" }, { status: 500 });
    }

    if (!profile) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Use getUserFeedPage for user-specific feeds
    const result = await getUserFeedPage({ cursor, limit, author_id: profile.user_id });
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
  // Try Authorization header first, then fallback to cookies
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  let user = null;
  if (token) {
    const { getUserFromToken } = await import("@/lib/auth");
    user = await getUserFromToken(token);
  }

  if (!user) {
    user = await getUser(); // Fallback to cookie auth
  }

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const parsed = await CreatePost.safeParseAsync(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues }, { status: 400 });

  const { images, text } = parsed.data;


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
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ post: data }, { status: 201 });
}
