import { type NextRequest, NextResponse } from "next/server";
import { getFollowStats } from "@/app/actions/follow";
import { getUser } from "@/lib/auth";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ username: string }> },
) {
	try {
		// Get user from JWT token in cookies
		const user = await getUser();
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { username } = await params;

		// Get follow stats for the specific user
		const followStats = await getFollowStats(username, user.id);

		return NextResponse.json({ followStats });
	} catch (error) {
		console.error("Error fetching follow stats:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
