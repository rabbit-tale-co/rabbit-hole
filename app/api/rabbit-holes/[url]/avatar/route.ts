import { type NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { logSecureError } from "@/lib/secure-db";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "auto";
export const maxDuration = 60;

const EXTERNAL_API_URL =
  process.env.NEXT_PUBLIC_BACKEND ||
  process.env.NEXT_PUBLIC_MEDIA_API_URL ||
  "https://api.rabbittale.co";

export const POST = withAuth(async (req: NextRequest, { userId }) => {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const cropX = Number(form.get("crop_x") || 0);
    const cropY = Number(form.get("crop_y") || 0);
    const cropW = Number(form.get("crop_w") || 0);
    const cropH = Number(form.get("crop_h") || 0);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    // Resolve rabbit hole by URL and verify ownership
    const urlSlug = req.nextUrl.pathname.split("/").slice(-2, -1)[0];
    const { data: rh, error } = await supabaseAdmin
      .from("rabbit_holes")
      .select("id, owner_id")
      .eq("url", urlSlug)
      .single();
    if (error || !rh) return NextResponse.json({ error: "Rabbit hole not found" }, { status: 404 });
    if (rh.owner_id !== userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Forward to external API
    const externalForm = new FormData();
    externalForm.append("rabbitHoleId", rh.id);
    externalForm.append("file", file);
    if (cropX || cropY || cropW || cropH) {
      externalForm.append("crop_x", String(cropX));
      externalForm.append("crop_y", String(cropY));
      externalForm.append("crop_w", String(cropW));
      externalForm.append("crop_h", String(cropH));
    }

    const extRes = await fetch(`${EXTERNAL_API_URL}/social/v1/profile/avatar`, {
      method: "POST",
      body: externalForm,
    });
    if (!extRes.ok) {
      const txt = await extRes.text().catch(() => "External API error");
      logSecureError("rabbit_hole_avatar_external_error", new Error(txt), userId);
      return NextResponse.json({ error: "External processing failed", details: txt }, { status: 502 });
    }
    const result = await extRes.json();
    const finalUrl = result.url || `${EXTERNAL_API_URL}/${result.path}`;
    // Pure proxy: DB update happens via client calling /api/rabbit-holes/update-images
    return NextResponse.json({ url: finalUrl, path: result.path, imageId: result.imageId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    logSecureError("rabbit_hole_avatar_error", e, userId);
    return NextResponse.json({ error: "server_error", message: msg }, { status: 500 });
  }
});
