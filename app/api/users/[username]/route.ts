import { NextRequest } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const Username = z.string().min(3).max(20).regex(/^[a-z0-9_]+$/);

export async function GET(_req: NextRequest, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params;
  const parsed = Username.safeParse(username);
  if (!parsed.success) return Response.json({ error: "bad username" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .schema('social_art')
    .from("profiles")
    .select("user_id, username, display_name, bio, avatar_url, cover_url, accent_color, is_premium, is_admin")
    .eq("username", parsed.data)
    .maybeSingle();

  if (error) {
    console.error("/api/users/[username] db error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) return Response.json({ error: "not found" }, { status: 404 });

  if (!data) return Response.json({ error: "not found" }, { status: 404 });

  // join suspension (if exists)
  const { data: susp } = await supabaseAdmin
    .schema('social_art')
    .from('suspended_users')
    .select('banned_until')
    .eq('user_id', data.user_id)
    .maybeSingle();

  const profile = { ...data, banned_until: (susp as { banned_until?: string | null } | null)?.banned_until ?? null };
  return Response.json({ profile });
}
