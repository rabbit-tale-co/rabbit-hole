import { type NextRequest, NextResponse } from "next/server";
import { getPostStats } from "@/app/actions/posts";
import { verifySupabaseJWT } from "@/lib/jwt-utils";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		// Get JWT token from Authorization header
		const authHeader = request.headers.get("authorization");
		const token = authHeader?.startsWith("Bearer ")
			? authHeader.slice(7)
			: null;

		if (!token) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Verify JWT token
		const jwtResult = await verifySupabaseJWT(token);
		if (!jwtResult) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: postId } = await params;

		// Get post stats
		const result = await getPostStats(postId);

		if (result.error) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({ stats: result.stats });
	} catch (error) {
		console.error("Error fetching post stats:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
