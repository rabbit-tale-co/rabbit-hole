import { NextRequest, NextResponse } from "next/server";
import { trackPostView } from "@/app/actions/posts";
import { verifySupabaseJWT } from "@/lib/jwt-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get JWT token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT token
    const jwtResult = await verifySupabaseJWT(token);
    if (!jwtResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId } = await params;

    // Track the post view
    const result = await trackPostView(postId, jwtResult.userId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking post view:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
