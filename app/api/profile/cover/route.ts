import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth";
import { logSecureError } from "@/lib/secure-db";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const preferredRegion = "auto";

// External API endpoint for media processing
const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_BACKEND || process.env.NEXT_PUBLIC_MEDIA_API_URL || "https://api.rabbittale.co";

export const POST = withAuth(async (req: NextRequest, { userId: authenticatedUserId }) => {
  try {
    const form = await req.formData();
    const requestedUserId = String(form.get("userId") || "");
    const file = form.get("file");
    const cropX = Number(form.get("crop_x") || 0);
    const cropY = Number(form.get("crop_y") || 0);
    const cropW = Number(form.get("crop_w") || 0);
    const cropH = Number(form.get("crop_h") || 0);

    // SECURITY: Verify that user can only modify their own profile
    if (requestedUserId !== authenticatedUserId) {
      logSecureError('cover_unauthorized_access', new Error('User tried to modify another user\'s cover'), authenticatedUserId);
      return NextResponse.json({ error: "Unauthorized - You can only modify your own cover" }, { status: 403 });
    }

    console.log("[cover] request: userId=%s name=%s type=%s size=%d crop=%d,%d %dx%d", authenticatedUserId, (file as File).name, (file as File).type, (file as File).size, cropX, cropY, cropW, cropH);
    if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });

    // Forward request to external API for processing
    const externalFormData = new FormData();
    externalFormData.append("userId", authenticatedUserId);
    externalFormData.append("file", file);
    if (cropX > 0 || cropY > 0 || cropW > 0 || cropH > 0) {
      externalFormData.append("crop_x", String(cropX));
      externalFormData.append("crop_y", String(cropY));
      externalFormData.append("crop_w", String(cropW));
      externalFormData.append("crop_h", String(cropH));
    }

    const externalResponse = await fetch(`${EXTERNAL_API_URL}/social/v1/profile/cover`, {
      method: "POST",
      body: externalFormData,
    });

    if (!externalResponse.ok) {
      const errorText = await externalResponse.text().catch(() => "External API error");
      console.error("[cover] external API error:", errorText);
      return NextResponse.json({ error: "External processing failed", details: errorText }, { status: 500 });
    }

    const result = await externalResponse.json();
    console.log("[cover] external API success:", result);

    return NextResponse.json({
      path: result.path,
      url: result.url || `${EXTERNAL_API_URL}/${result.path}`,
      mime: result.mime,
      ext: result.ext || (result.mime?.includes('webm') ? 'webm' : 'webp'),
      crop: { x: cropX, y: cropY, w: cropW, h: cropH }
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    logSecureError('cover_upload_error', e, authenticatedUserId);
    console.error("[cover] error:", msg);
    return NextResponse.json({ error: "server_error", message: msg }, { status: 500 });
  }
});
