import { NextRequest, NextResponse } from "next/server";
import { getBatchFollowStats } from "@/app/actions/follow";
import { getUser, getUserFromToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Try to get user from Authorization header first, then fall back to cookies
    const authHeader = request.headers.get('authorization');
    let user = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      user = await getUserFromToken(token);
    }

    // Fallback to cookie-based auth
    if (!user) {
      user = await getUser();
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userIds } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Invalid userIds array" }, { status: 400 });
    }

    // Limit the number of users to prevent abuse
    if (userIds.length > 100) {
      return NextResponse.json({ error: "Too many userIds (max 100)" }, { status: 400 });
    }

    // Get batch follow stats for all users
    const stats = await getBatchFollowStats(userIds, user.id);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching batch follow stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
