import { NextRequest, NextResponse } from "next/server";
import { getBatchFollowStats } from "@/app/actions/follow";
import { getUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
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
    const followStats = await getBatchFollowStats(userIds, user.id);

    return NextResponse.json({ followStats });
  } catch (error) {
    console.error("Error fetching batch follow stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
