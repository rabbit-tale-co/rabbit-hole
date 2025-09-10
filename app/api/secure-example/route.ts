import { type NextRequest, NextResponse } from "next/server";
import { getSecureUserProfile, logSecureError } from "@/lib/secure-db";
import { withAuth } from "@/middleware/auth";

/**
 * Example secure API endpoint
 * Uses auth middleware and secure database queries
 */
export const GET = withAuth(async (request: NextRequest, { userId }) => {
	try {
		// Get user profile securely
		const profile = await getSecureUserProfile(userId);

		return NextResponse.json({
			success: true,
			data: {
				userId: profile.user_id,
				username: profile.username,
				displayName: profile.display_name,
				isPremium: profile.is_premium,
				// Do not return sensitive data like is_admin, banned_until etc.
			},
		});
	} catch (error) {
		logSecureError("get_user_profile", error, userId);

		return NextResponse.json(
			{
				success: false,
				error: "Failed to get user profile",
			},
			{ status: 500 },
		);
	}
});

/**
 * Example POST endpoint with data validation
 */
export const POST = withAuth(async (request: NextRequest, { userId }) => {
	try {
		const body = await request.json();

		// Data validation
		if (!body || typeof body !== "object") {
			return NextResponse.json(
				{ success: false, error: "Invalid request body" },
				{ status: 400 },
			);
		}

		// Check if user is banned
		const { isUserBanned } = await import("@/lib/secure-db");
		if (await isUserBanned(userId)) {
			return NextResponse.json(
				{ success: false, error: "User is banned" },
				{ status: 403 },
			);
		}

		// Here you can add business logic
		// All database operations through secure-db.ts

		return NextResponse.json({
			success: true,
			message: "Operation completed successfully",
		});
	} catch (error) {
		logSecureError("secure_post_operation", error, userId);

		return NextResponse.json(
			{
				success: false,
				error: "Operation failed",
			},
			{ status: 500 },
		);
	}
});
