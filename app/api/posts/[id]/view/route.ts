import { NextRequest, NextResponse } from "next/server";
import { trackPostView } from "@/app/actions/posts";
import { getUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId } = await params;

    // Track the post view
    const result = await trackPostView(postId, user.id);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking post view:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
