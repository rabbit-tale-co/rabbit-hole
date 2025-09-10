import { NextRequest, NextResponse } from "next/server";
import { getRabbitHoleByName, getRabbitHoleFeedPage } from "@/app/actions/rabbit-holes";

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "24");
    const cursor = searchParams.get("cursor");

    console.log("[API] Fetching rabbit hole:", { name, limit, cursor });

    // Get rabbit hole info
    const { data: rabbitHole, error: rabbitHoleError } = await getRabbitHoleByName(name);

    if (rabbitHoleError) {
      console.error("[API] Error fetching rabbit hole:", rabbitHoleError);
      return NextResponse.json({ error: rabbitHoleError }, { status: 500 });
    }

    if (!rabbitHole) {
      return NextResponse.json({ error: "Rabbit hole not found" }, { status: 404 });
    }

    // Get feed
    const { data: feed, error: feedError } = await getRabbitHoleFeedPage({
      rabbit_hole_id: rabbitHole.id,
      limit,
      cursor: cursor || undefined,
    });

    if (feedError) {
      console.error("[API] Error fetching feed:", feedError);
      return NextResponse.json({ error: feedError }, { status: 500 });
    }

    console.log("[API] Rabbit hole feed fetched successfully:", {
      rabbitHole: rabbitHole.name,
      postCount: feed?.items?.length || 0,
      hasMore: feed?.nextCursor !== null,
    });

    return NextResponse.json({
      rabbitHole,
      items: feed?.items || [],
      nextCursor: feed?.nextCursor,
    });
  } catch (error) {
    console.error("[API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
