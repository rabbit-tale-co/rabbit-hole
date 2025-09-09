import { NextRequest } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUser } from "@/lib/auth";

const Id = z.uuid();

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = Id.safeParse(id);
  if (!parsed.success) return Response.json({ error: "bad id" }, { status: 400 });
  const { count, error } = await supabaseAdmin
    .from('likes')
    .select('user_id', { count: 'exact', head: true })
    .eq('post_id', parsed.data);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ count: count || 0 });
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = Id.safeParse(id);
  if (!parsed.success) return Response.json({ error: "bad id" }, { status: 400 });

  // Try to get user from Authorization header first, then fallback to cookies
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  let user = null;
  if (token) {
    const { getUserFromToken } = await import("@/lib/auth");
    user = await getUserFromToken(token);
  }

  if (!user) {
    user = await getUser();
  }

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // toggle like
  const { data: existing } = await supabaseAdmin.from('likes').select('*').eq('post_id', parsed.data).eq('user_id', user.id).maybeSingle();
  if (existing) {
    const { error } = await supabaseAdmin.from('likes').delete().eq('post_id', parsed.data).eq('user_id', user.id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ liked: false });
  } else {
    const { error } = await supabaseAdmin.from('likes').insert({ post_id: parsed.data, user_id: user.id });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ liked: true });
  }
}
