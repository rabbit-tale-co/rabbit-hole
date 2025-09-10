import { type NextRequest, NextResponse } from "next/server";
import { logSecureError } from "@/lib/secure-db";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { withAuth } from "@/middleware/auth";

let ffmpegPath: string | null = null;
try {
  const mod = await import("ffmpeg-static");
  ffmpegPath = (mod as unknown as { default?: string }).default || (mod as unknown as string);
} catch {
  ffmpegPath = null;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "auto";
export const maxDuration = 60;

// External API endpoint for media processing
const EXTERNAL_API_URL =
	process.env.NEXT_PUBLIC_BACKEND ||
	process.env.NEXT_PUBLIC_MEDIA_API_URL ||
	"https://api.rabbittale.co";

export const POST = withAuth(
	async (req: NextRequest, { userId: authenticatedUserId }) => {
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
				logSecureError(
					"avatar_unauthorized_access",
					new Error("User tried to modify another user's avatar"),
					authenticatedUserId,
				);
				return NextResponse.json(
					{ error: "Unauthorized - You can only modify your own avatar" },
					{ status: 403 },
				);
			}

			console.log(
				"[avatar] request: userId=%s name=%s type=%s size=%d crop=%d,%d %dx%d",
				authenticatedUserId,
				(file as File).name,
				(file as File).type,
				(file as File).size,
				cropX,
				cropY,
				cropW,
				cropH,
			);
			if (!(file instanceof File))
				return NextResponse.json({ error: "No file" }, { status: 400 });

			// Check if file is GIF and validate premium status
			const isGif =
				(file.type || "").toLowerCase() === "image/gif" ||
				(file.name || "").toLowerCase().endsWith(".gif");

			if (isGif) {
				// Check if user has premium status
				const { data: profile, error: profileError } = await supabaseAdmin
					.from("profiles")
					.select("is_premium")
					.eq("user_id", authenticatedUserId)
					.single();

				if (profileError) {
					logSecureError(
						"avatar_premium_check_error",
						profileError,
						authenticatedUserId,
					);
					return NextResponse.json(
						{ error: "Failed to verify premium status" },
						{ status: 500 },
					);
				}

				if (!profile?.is_premium) {
					logSecureError(
						"avatar_gif_unauthorized",
						new Error("Non-premium user tried to upload GIF avatar"),
						authenticatedUserId,
					);
					return NextResponse.json(
						{
							error:
								"GIF avatars are available only for Golden Carrot subscribers",
						},
						{ status: 403 },
					);
				}
			}

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

			const externalResponse = await fetch(
				`${EXTERNAL_API_URL}/social/v1/profile/avatar`,
				{
					method: "POST",
					body: externalFormData,
				},
			);

			if (!externalResponse.ok) {
				const errorText = await externalResponse
					.text()
					.catch(() => "External API error");
				console.error("[avatar] external API error:", errorText);
				return NextResponse.json(
					{ error: "External processing failed", details: errorText },
					{ status: 500 },
				);
			}

			const result = await externalResponse.json();
			console.log("[avatar] external API success:", result);

			return NextResponse.json({
				path: result.path,
				url: result.url || `${EXTERNAL_API_URL}/${result.path}`,
				mime: result.mime,
				ext: result.ext || (result.mime?.includes("webm") ? "webm" : "webp"),
				crop: { x: cropX, y: cropY, w: cropW, h: cropH },
			});
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : String(e);
			logSecureError("avatar_upload_error", e, authenticatedUserId);
			console.error("[avatar] error:", msg);
			return NextResponse.json(
				{ error: "server_error", message: msg },
				{ status: 500 },
			);
		}
	},
);
