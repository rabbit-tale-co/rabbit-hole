import { NextRequest } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { deletePost } from "@/app/actions/posts";

const Id = z.uuid();

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = Id.safeParse(id);
  if (!parsed.success) return Response.json({ error: "bad id" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("id", parsed.data)
    .single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: "not_found" }, { status: 404 });

  // fetch author profile (public fields)
  const { data: author, error: pErr } = await supabaseAdmin
    .from("profiles")
    .select("username, display_name, avatar_url, is_premium")
    .eq("user_id", data.author_id)
    .single();
  if (pErr) return Response.json({ error: pErr.message }, { status: 500 });

  return Response.json({ post: data, author });
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = Id.safeParse(id);
  if (!parsed.success) return Response.json({ error: "bad id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  if (body?._action === "delete") {
    console.log(`[API] Delete post request for ID: ${parsed.data}`);

    // Get JWT token from Authorization header first, then from body as fallback
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const bodyToken = body.token;

    const token = bearerToken || bodyToken;
    console.log(`[API] JWT token from header: ${bearerToken ? 'YES' : 'NO'}`);
    console.log(`[API] JWT token from body: ${bodyToken ? 'YES' : 'NO'}`);
    console.log(`[API] Using token: ${token ? 'YES' : 'NO'}`);

    if (!token) {
      return Response.json({ error: "JWT token required in Authorization header or body" }, { status: 400 });
    }

    // Verify JWT token directly
    const { verifySupabaseJWT } = await import("@/lib/jwt-utils");
    const jwtResult = await verifySupabaseJWT(token);
    console.log(`[API] JWT verification result:`, jwtResult ? { userId: jwtResult.userId } : 'null');

    if (!jwtResult) {
      return Response.json({ error: "Invalid JWT token" }, { status: 401 });
    }

    // Use deletePost function for proper JWT logging and validation
    console.log(`[API] Calling deletePost with postId: ${parsed.data}, userId: ${jwtResult.userId}`);
    const result = await deletePost(parsed.data, jwtResult.userId);
    console.log(`[API] DeletePost result:`, result);

    if (result.error) return Response.json({ error: result.error }, { status: 500 });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "unsupported" }, { status: 400 });
}
