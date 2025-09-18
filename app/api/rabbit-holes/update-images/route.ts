import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PATCH = withAuth(async (req: NextRequest, { userId }) => {
  const body = await req.json();
  const { rabbit_hole_id, avatar_url, cover_url } = body as {
    rabbit_hole_id: string;
    avatar_url?: string | null;
    cover_url?: string | null;
  };

  if (!rabbit_hole_id) {
    return NextResponse.json({ error: "rabbit_hole_id required" }, { status: 400 });
  }

  const { data: rh, error } = await supabaseAdmin
    .from("rabbit_holes")
    .select("id, owner_id")
    .eq("id", rabbit_hole_id)
    .single();

  if (error || !rh) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (rh.owner_id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const STORAGE_PUBLIC_BASE = (process.env.NEXT_PUBLIC_STORAGE_PUBLIC_BASE || process.env.STORAGE_PUBLIC_BASE || "").replace(/\/$/, "");
  const absolutize = (u: string | null | undefined): string | null => {
    if (u == null || u === "") return u ?? null;
    if (/^https?:\/\//i.test(u)) return u;
    return STORAGE_PUBLIC_BASE ? `${STORAGE_PUBLIC_BASE}/${u.replace(/^\/?/, "")}` : u;
  };

  const updatePayload: Record<string, string | null> = {};
  if (typeof avatar_url !== "undefined") updatePayload.avatar_url = absolutize(avatar_url);
  if (typeof cover_url !== "undefined") updatePayload.cover_url = absolutize(cover_url);

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error: updErr } = await supabaseAdmin
    .from("rabbit_holes")
    .update(updatePayload)
    .eq("id", rabbit_hole_id);

  if (updErr) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
});
