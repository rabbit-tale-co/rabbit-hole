// app/api/posts/route.ts
import type { NextRequest } from "next/server";
import { getFeedPage, getUserFeedPage, createPost } from "@/app/actions/posts";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CreatePost, Cursor } from "@/lib/validation";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const parsed = Cursor.safeParse({
		cursor: searchParams.get("cursor") ?? undefined,
		limit: Number(searchParams.get("limit") ?? "24"),
	});
	if (!parsed.success)
		return Response.json({ error: "bad cursor" }, { status: 400 });

	// Try to get user from Authorization header first, then fallback to cookies
	const authHeader = req.headers.get("authorization");
	const token = authHeader?.replace("Bearer ", "");

	let user = null;
	if (token) {
		const { getUserFromToken } = await import("@/lib/auth");
		user = await getUserFromToken(token);
	}

	if (!user) {
		user = await getUser();
	}

	const { cursor, limit } = parsed.data;
	const username = searchParams.get("username");

	let result;
	if (username) {
		// Get user_id from username for user-specific feed
		const { data: profile, error: profileError } = await supabaseAdmin
			.from("profiles")
			.select("user_id")
			.eq("username", username)
			.maybeSingle();

		if (profileError) {
			console.error("/api/posts profile error:", profileError.message);
			return Response.json({ error: profileError.message }, { status: 500 });
		}
		if (!profile) {
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		result = await getUserFeedPage({
			cursor,
			limit,
			author_id: profile.user_id,
		});
	} else {
		// Use getFeedPage for main feed (includes stats)
		result = await getFeedPage({ cursor, limit });
	}

	if (result.error)
		return Response.json({ error: result.error }, { status: 400 });

	// Attach current-user like flags for returned page only
	if (user && result.items && result.items.length > 0) {
		try {
			const postIds = result.items.map((p) => p.id);
			const { data: likes } = await supabaseAdmin
				.from("likes")
				.select("post_id")
				.eq("user_id", user.id)
				.in("post_id", postIds);
			const liked = new Set((likes || []).map((l) => l.post_id));
			result.items = result.items.map((p) => ({
				...p,
				is_liked: liked.has(p.id),
			}));
		} catch {
			// Error loading likes - continue without is_liked flags
		}
	}

	return Response.json(result);
}

export async function POST(req: NextRequest) {
	// Try Authorization header first, then fallback to cookies
	const authHeader = req.headers.get("authorization");
	const token = authHeader?.replace("Bearer ", "");

	let user = null;
	if (token) {
		const { getUserFromToken } = await import("@/lib/auth");
		user = await getUserFromToken(token);
	}

	if (!user) {
		user = await getUser(); // Fallback to cookie auth
	}

	if (!user) {
		return new Response("Unauthorized", { status: 401 });
	}

	const body = await req.json();
	const parsed = await CreatePost.safeParseAsync(body);
	if (!parsed.success)
		return Response.json({ error: parsed.error.issues }, { status: 400 });

	// Use createPost action which handles ID properly
	const result = await createPost({
		...parsed.data,
		author_id: user.id,
	});

	if (result.error) {
		return Response.json({ error: result.error }, { status: 500 });
	}

	return Response.json({ post: result.post }, { status: 201 });
}
