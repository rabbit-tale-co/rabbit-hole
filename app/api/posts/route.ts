import { NextRequest, NextResponse } from "next/server";
import { getFeedPage, getUserFeedPage, getFollowingFeedPage, createPost, getUserRepliesPage, getUserLikedPage } from "@/app/actions/posts";
import { getRabbitHoleFeedPage } from "@/app/actions/rabbit-holes";
import { CreatePost } from "@/schemas/post";
import { verifySupabaseJWT } from "@/lib/jwt-utils";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const take = parseInt(searchParams.get("take") || searchParams.get("limit") || "24");
		const skip = parseInt(searchParams.get("skip") || searchParams.get("offset") || "0");
		const cursorId = searchParams.get("id");
		const cursorCreatedAt = searchParams.get("created_at");
		const userId = searchParams.get("userId");
		const username = searchParams.get("username");
		const following = searchParams.get("following");
		const rabbitHole = searchParams.get("rabbitHole");
		const profileFeedType = searchParams.get("profileFeedType");

		console.log("[API] Fetching posts:", { take, skip, cursorId, cursorCreatedAt, userId, username, following, rabbitHole, profileFeedType });

		// Get user_id from token for is_liked checking
		let currentUserId: string | null = null;
		const authHeader = req.headers.get("authorization");
		if (authHeader?.startsWith("Bearer ")) {
			const token = authHeader.substring(7);
			const user = await verifySupabaseJWT(token);
			if (user) {
				currentUserId = user.userId;
			}
		}


		let result;
		if (following === "true") {
			// Get authorization header for following feed
			const authHeader = req.headers.get("authorization");
			if (!authHeader?.startsWith("Bearer ")) {
				return NextResponse.json({ error: "Authentication required for following feed" }, { status: 401 });
			}

			const token = authHeader.substring(7);
			const user = await verifySupabaseJWT(token);
			if (!user) {
				return NextResponse.json({ error: "Invalid token" }, { status: 401 });
			}

			result = await getFollowingFeedPage({
				user_id: user.userId,
				take,
				skip,
				cursorId: cursorId || undefined,
				cursorCreatedAt: cursorCreatedAt || undefined,
				user_id_for_likes: currentUserId || undefined
			});
		} else if (rabbitHole) {
			// Handle rabbit hole feed
			const { supabaseAdmin } = await import("@/lib/supabase-admin");

			const { data: rabbitHoleData, error: rabbitHoleError } = await supabaseAdmin
				.from("rabbit_holes")
				.select("id, url")
				.eq("url", rabbitHole)
				.single();

			if (!rabbitHoleData) {
				return NextResponse.json({ error: "Rabbit hole not found" }, { status: 404 });
			}
			result = await getRabbitHoleFeedPage({
				rabbit_hole_id: rabbitHoleData.id,
				take,
				skip,
				cursorId: cursorId || undefined,
				cursorCreatedAt: cursorCreatedAt || undefined,
				user_id: currentUserId || undefined
			});
		} else if (userId) {
			result = await getUserFeedPage({
				author_id: userId,
				take,
				skip,
				cursorId: cursorId || undefined,
				cursorCreatedAt: cursorCreatedAt || undefined,
				user_id: currentUserId || undefined
			});
		} else if (username) {
			// Convert username to userId
			const { supabaseAdmin } = await import("@/lib/supabase-admin");
			const { data: profile } = await supabaseAdmin
				.from("profiles")
				.select("user_id")
				.eq("username", username)
				.single();

			if (!profile) {
				return NextResponse.json({ error: "User not found" }, { status: 404 });
			}

			// Handle profile feed types (posts, replies, liked)
			if (profileFeedType === "replies") {
				// Get user's replies (comments)
				result = await getUserRepliesPage({
					author_id: profile.user_id,
					take,
					skip,
					cursorId: cursorId || undefined,
					cursorCreatedAt: cursorCreatedAt || undefined,
					user_id: currentUserId || undefined
				});
			} else if (profileFeedType === "liked") {
				// Get user's liked posts
				if (!currentUserId || currentUserId !== profile.user_id) {
					return NextResponse.json({ error: "Authentication required for liked posts" }, { status: 401 });
				}
				result = await getUserLikedPage({
					user_id: currentUserId,
					take,
					skip,
					cursorId: cursorId || undefined,
					cursorCreatedAt: cursorCreatedAt || undefined
				});
			} else {
				// Default: user's posts
				result = await getUserFeedPage({
					author_id: profile.user_id,
					take,
					skip,
					cursorId: cursorId || undefined,
					cursorCreatedAt: cursorCreatedAt || undefined,
					user_id: currentUserId || undefined
				});
			}
		} else {
			result = await getFeedPage({
				take,
				skip,
				cursorId: cursorId || undefined,
				cursorCreatedAt: cursorCreatedAt || undefined,
				user_id: currentUserId || undefined
			});
		}

		if (result.error) {
			console.error("[API] Error fetching posts:", result.error);
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		console.log("[API] Posts fetched successfully:", {
			postCount: result.items?.length || 0,
			hasMore: result.nextCursor !== null,
			nextId: result.nextId,
			nextCreatedAt: result.nextCreatedAt
		});

		return NextResponse.json({
			items: result.items || [],
			nextCursor: result.nextCursor,
			nextId: result.nextId,
			nextCreatedAt: result.nextCreatedAt,
		});
	} catch (error) {
		console.error("[API] Unexpected error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		// Get authorization header
		const authHeader = req.headers.get("authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return NextResponse.json({ error: "Missing or invalid authorization" }, { status: 401 });
		}

		const token = authHeader.substring(7);
		const user = await verifySupabaseJWT(token);
		if (!user || !user.userId) {
			console.error("[API] Invalid user or userId:", { user, userId: user?.userId });
			return NextResponse.json({ error: "Invalid token or missing user ID" }, { status: 401 });
		}

		const body = await req.json();
		console.log("[API] Creating post with data:", {
			postId: body.id,
			authorId: user.userId,
			imageCount: body.images?.length || 0,
			imageIds: body.images?.map((img: any) => img.id) || [],
			rawBody: body
		});

		// Add author_id to body before validation
		const bodyWithAuthor = {
			...body,
			author_id: user.userId,
		};

		const parsed = await CreatePost.safeParseAsync(bodyWithAuthor);
		if (!parsed.success) {
			console.error("[API] Validation failed:", parsed.error.issues);
			return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
		}

		const result = await createPost({
			...parsed.data,
			id: body.id, // Ensure the ID is passed correctly
		}, true); // Skip auth since we already authenticated in the API route

		if (result.error) {
			console.error("[API] createPost failed:", result.error);
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		console.log("[API] Post created successfully:", {
			postId: result.post?.id,
			imageCount: result.post?.images?.length || 0
		});

		return NextResponse.json({ post: result.post }, { status: 201 });
	} catch (error) {
		console.error("[API] Unexpected error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
