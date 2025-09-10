import { type NextRequest, NextResponse } from "next/server";
import { verifySupabaseJWT } from "@/lib/jwt-utils";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-cookies";

/**
 * Middleware to secure API endpoints
 * Checks JWT token from Authorization header or cookies
 */
export async function validateAuthToken(
	request?: NextRequest,
): Promise<{ userId: string } | null> {
	try {
		let userId: string | null = null;

		// Try to get token from Authorization header first
		if (request) {
			const authHeader = request.headers.get("authorization");
			if (authHeader?.startsWith("Bearer ")) {
				const token = authHeader.substring(7);
				const authResult = await verifySupabaseJWT(token);
				if (authResult) {
					userId = authResult.userId;
				}
			}
		}

		// Fallback to cookies if no header token
		if (!userId) {
			const supabase = await createClient();
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error || !user) {
				return null;
			}
			userId = user.id;
		}

		// Check if user exists in database
		const { data: profile, error: profileError } = await supabaseAdmin
			.schema("social_art")
			.from("profiles")
			.select("user_id")
			.eq("user_id", userId)
			.single();

		if (profileError || !profile) {
			console.error("User not found in database:", profileError);
			return null;
		}

		return { userId };
	} catch (error) {
		console.error("Auth validation error:", error);
		return null;
	}
}

/**
 * Middleware wrapper for API routes
 * Automatically checks authentication and adds userId to request
 */
export function withAuth(
	handler: (
		request: NextRequest,
		context: { userId: string },
	) => Promise<NextResponse>,
) {
	return async (request: NextRequest): Promise<NextResponse> => {
		const authResult = await validateAuthToken(request);

		if (!authResult) {
			return NextResponse.json(
				{ error: "Unauthorized - Invalid or missing authentication token" },
				{ status: 401 },
			);
		}

		try {
			return await handler(request, { userId: authResult.userId });
		} catch (error) {
			console.error("API handler error:", error);
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 },
			);
		}
	};
}

/**
 * Middleware to check admin privileges
 */
export async function validateAdminAuth(
	request?: NextRequest,
): Promise<{ userId: string } | null> {
	const authResult = await validateAuthToken(request);
	if (!authResult) return null;

	try {
		// Check if user has admin privileges
		const { data: profile, error } = await supabaseAdmin
			.schema("social_art")
			.from("profiles")
			.select("is_admin")
			.eq("user_id", authResult.userId)
			.single();

		if (error || !profile || !profile.is_admin) {
			console.error("User is not admin:", error);
			return null;
		}

		return authResult;
	} catch (error) {
		console.error("Admin auth validation error:", error);
		return null;
	}
}

/**
 * Middleware wrapper for admin API routes
 */
export function withAdminAuth(
	handler: (
		request: NextRequest,
		context: { userId: string },
	) => Promise<NextResponse>,
) {
	return async (request: NextRequest): Promise<NextResponse> => {
		const authResult = await validateAdminAuth(request);

		if (!authResult) {
			return NextResponse.json(
				{ error: "Unauthorized - Admin access required" },
				{ status: 403 },
			);
		}

		try {
			return await handler(request, { userId: authResult.userId });
		} catch (error) {
			console.error("Admin API handler error:", error);
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 },
			);
		}
	};
}
