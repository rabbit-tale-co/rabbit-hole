import { NextRequest } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const Username = z.string().min(3).max(20).regex(/^[a-z0-9_]+$/);

export async function GET(_req: NextRequest, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params;
  const parsed = Username.safeParse(username);
  if (!parsed.success) return Response.json({ error: "bad username" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("user_id, username, display_name, avatar_url, cover_url, accent_color, is_premium")
    .eq("username", parsed.data)
    .maybeSingle();

  if (error) {
    console.error("/api/users/[username] db error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!data) return Response.json({ error: "not found" }, { status: 404 });

  return Response.json({ profile: data });
}
