import { NextRequest } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

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
    // soft delete for safety
    const { error } = await supabaseAdmin
      .from("posts")
      .update({ is_deleted: true })
      .eq("id", parsed.data);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "unsupported" }, { status: 400 });
}
