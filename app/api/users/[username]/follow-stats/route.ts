import { NextRequest, NextResponse } from "next/server";
import { getFollowStats } from "@/app/actions/follow";
import { verifySupabaseJWT } from "@/lib/jwt-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
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

    const { username } = params;

    // Get follow stats for the specific user
    const followStats = await getFollowStats(username, jwtResult.userId);

    return NextResponse.json({ followStats });
  } catch (error) {
    console.error("Error fetching follow stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
