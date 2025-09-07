import { NextRequest, NextResponse } from "next/server";
import { getBatchFollowStats } from "@/app/actions/follow";
import { verifySupabaseJWT } from "@/lib/jwt-utils";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { userIds } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Invalid userIds" }, { status: 400 });
    }

    // Limit batch size to prevent abuse
    if (userIds.length > 50) {
      return NextResponse.json({ error: "Too many userIds" }, { status: 400 });
    }

    // Get follow stats for all users in one batch
    const followStats = await getBatchFollowStats(userIds, jwtResult.userId);

    return NextResponse.json({ followStats });
  } catch (error) {
    console.error("Error fetching batch follow stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
