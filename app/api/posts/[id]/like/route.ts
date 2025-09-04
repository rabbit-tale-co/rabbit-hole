import { NextRequest } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
// no direct helpers used here, manual token read

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

  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  const cookie = req.headers.get("cookie") || req.headers.get("Cookie");
  let accessToken: string | null = null;
  if (auth && auth.startsWith("Bearer ")) accessToken = auth.slice(7);
  if (!accessToken && cookie) {
    const match = /(?:^|; )sb-access-token=([^;]+)/.exec(cookie);
    if (match) accessToken = decodeURIComponent(match[1]);
  }
  let user: { id: string } | null = null;
  if (accessToken) {
    const { data } = await supabaseAdmin.auth.getUser(accessToken);
    if (data?.user) user = { id: data.user.id };
  }
  if (!user) return new Response("Unauthorized", { status: 401 });

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
// removed placeholder handlers
