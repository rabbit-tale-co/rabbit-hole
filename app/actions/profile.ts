"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySupabaseJWT } from "@/lib/jwt-utils";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-cookies";
import { UpsertProfileClient } from "@/schemas/profile";
import { sanitizeUsersListResponse } from "@/utils/userSanitizer";
// import { getBatchFollowStats } from "./follow"; // No longer needed - follow stats loaded on hover

export async function upsertProfile(input: unknown, token?: string) {
	// const callId = Math.random().toString(36).substring(7);
	// console.log(`[${callId}] upsertProfile called at ${new Date().toISOString()}`);

	// Parse client input (without user_id)
	const parsed = await UpsertProfileClient.safeParseAsync(input);
	if (!parsed.success) {
		// console.log(`[${callId}] Validation failed:`, parsed.error.issues);
		// Extract bannable words errors specifically
		const bannableWordsErrors = parsed.error.issues
			.filter(
				(issue) =>
					issue.code === "custom" &&
					issue.message?.includes("inappropriate content"),
			)
			.map((issue) => issue.message);

		if (bannableWordsErrors.length > 0) {
			return { error: bannableWordsErrors[0] };
		}

		// For other validation errors, return the first error message
		const firstError = parsed.error.issues[0];
		return { error: firstError.message || "Invalid input data" };
	}

	// Verify user authentication - try JWT token first, then cookies
	// console.log(`[${callId}] Starting authentication verification...`);
	let userId: string;

	try {
		// Try JWT token first if provided
		if (token) {
			// console.log(`[${callId}] [AUTH] Attempting JWT authentication with token:`, token.substring(0, 20) + '...');
			const authResult = await verifySupabaseJWT(token);
			if (authResult) {
				userId = authResult.userId;
				// console.log(`[${callId}] [AUTH] Profile update (JWT auth): ${userId}`);
			} else {
				// console.log(`[${callId}] [AUTH] JWT token verification failed`);
				throw new Error("Invalid JWT token");
			}
		} else {
			// console.log(`[${callId}] [AUTH] No JWT token provided, trying cookies...`);
			// Fallback to cookies
			const supabase = await createClient();
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error || !user) {
				// console.log(`[${callId}] Authentication failed:`, error?.message || 'No user');
				return { error: "Unauthorized" };
			}

			userId = user.id;
			// console.log(`[${callId}] [AUTH] Profile update (cookie auth): ${userId}`);
		}
	} catch {
		// console.error(`[${callId}] [AUTH] Authentication error:`, error);
		return { error: "Unauthorized" };
	}

	// find old username to revalidate old path if it changes
	let oldUsername: string | null = null;
	{
		const { data: existing } = await supabaseAdmin
			.from("profiles")
			.select("username")
			.eq("user_id", userId)
			.maybeSingle();
		oldUsername = (existing?.username as string | undefined) ?? null;
	}
	const { error, data } = await supabaseAdmin
		.from("profiles")
		.upsert(
			{
				user_id: userId,
				username: parsed.data.username,
				display_name: parsed.data.display_name,
				bio: parsed.data.bio ?? null,
				...(parsed.data.cover_url !== undefined
					? { cover_url: parsed.data.cover_url }
					: {}),
				...(parsed.data.accent_color !== undefined
					? { accent_color: parsed.data.accent_color }
					: {}),
			},
			{ onConflict: "user_id" },
		)
		.select()
		.single();
	if (error) return { error: error.message };
	try {
		if (data?.username) {
			revalidatePath(`/user/${data.username}`);
		}
		if (oldUsername && oldUsername !== data?.username) {
			revalidatePath(`/user/${oldUsername}`);
		}
		// Revalidate main page to show updated profile data
		revalidatePath("/");
		// Revalidate explore page
		revalidatePath("/explore");
	} catch {}
	return { profile: data };
}

export async function deleteAccount(userId: string, token?: string) {
	// Verify user authentication
	let authenticatedUserId: string;

	if (token) {
		// Use JWT token for authentication
		try {
			const authResult = await verifySupabaseJWT(token);
			if (!authResult) {
				// console.error('[JWT] Account deletion - JWT verification failed');
				return { error: "Unauthorized" };
			}
			authenticatedUserId = authResult.userId;
			// console.log(`[JWT] Account deletion (JWT auth): ${authenticatedUserId}`);
		} catch {
			// console.error('[JWT] Account deletion auth error:', error);
			return { error: "Unauthorized" };
		}
	} else {
		// Fallback to client-side authentication
		try {
			const { supabase } = await import("@/lib/supabase");
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user?.id) return { error: "Unauthorized" };
			authenticatedUserId = user.id;
			// console.log(`[JWT] Account deletion (client auth): ${authenticatedUserId}`);
		} catch {
			// console.error('[JWT] Account deletion auth error:', error);
			return { error: "Unauthorized" };
		}
	}

	// Verify user can only delete their own account
	if (authenticatedUserId !== userId) return { error: "Forbidden" };

	const sb = supabaseAdmin;
	// delete reactions and comments first (cascades may help, but do it explicitly)
	// posts: delete by author, bookmarks/likes/reposts/comments tied to user will cascade via FKs
	const tables = [
		{ table: "likes", col: "user_id" },
		{ table: "bookmarks", col: "user_id" },
		{ table: "reposts", col: "user_id" },
		{ table: "comments", col: "author_id" },
	];
	for (const t of tables) {
		const { error } = await sb.from(t.table).delete().eq(t.col, userId);
		if (error) return { error: error.message };
	}

	// delete posts authored by user (will cascade storage references logically if you track paths elsewhere)
	{
		const { error } = await sb.from("posts").delete().eq("author_id", userId);
		if (error) return { error: error.message };
	}

	// delete profile row
	{
		const { error } = await sb.from("profiles").delete().eq("user_id", userId);
		if (error) return { error: error.message };
	}

	// finally remove auth user via admin API
	const { error: authErr } = await sb.auth.admin.deleteUser(userId);
	if (authErr) return { error: authErr.message };
	return { ok: true };
}

export async function getUsersPage(input: unknown) {
	const parsed = z
		.object({
			cursor: z.string().optional(),
			limit: z.number().int().min(1).max(24).default(24),
		})
		.safeParse(input);
	if (!parsed.success) return { error: "Invalid cursor" };

	const sb = supabaseAdmin;
	const cursor = parsed.data.cursor;
	let decoded: { username: string; user_id: string } | null = null;
	if (cursor) {
		try {
			const [username, user_id] = Buffer.from(cursor, "base64")
				.toString("utf8")
				.split("|");
			decoded = { username, user_id };
		} catch {
			decoded = null;
		}
	}

	const query = sb
		.schema("social_art")
		.from("profiles")
		.select(
			"user_id, username, display_name, bio, avatar_url, cover_url, accent_color, is_premium",
		)
		.order("username", { ascending: true })
		.order("user_id", { ascending: true })
		.limit(parsed.data.limit);

	if (decoded) {
		// keyset: (username, user_id)
		query.gt("username", decoded.username);
	}

	const { data, error } = await query;
	if (error) return { error: error.message };

	// fetch suspension info for listed users
	const ids = (data ?? []).map((r) => r.user_id).filter(Boolean);
	const suspMap = new Map<string, string | null>();
	if (ids.length > 0) {
		const { data: susp } = await sb
			.schema("social_art")
			.from("suspended_users")
			.select("user_id, banned_until")
			.in("user_id", ids);
		for (const row of (susp || []) as {
			user_id: string;
			banned_until: string | null;
		}[]) {
			suspMap.set(row.user_id, row.banned_until ?? null);
		}
	}

	// Fetch follow stats for all users (counts only, no current user follow status)
	const followStatsMap = new Map<
		string,
		{ isFollowing: boolean; followers: number; following: number }
	>();
	if (ids.length > 0) {
		try {
			// Get follower counts for all users
			const { data: followerCounts } = await sb
				.schema("social_art")
				.from("follows")
				.select("following_id, follower_id")
				.in("following_id", ids);

			// Get following counts for all users
			const { data: followingCounts } = await sb
				.schema("social_art")
				.from("follows")
				.select("follower_id, following_id")
				.in("follower_id", ids);

			// Count followers and following for each user
			const followerCount = new Map<string, number>();
			const followingCount = new Map<string, number>();

			(followerCounts || []).forEach((follow) => {
				const count = followerCount.get(follow.following_id) || 0;
				followerCount.set(follow.following_id, count + 1);
			});

			(followingCounts || []).forEach((follow) => {
				const count = followingCount.get(follow.follower_id) || 0;
				followingCount.set(follow.follower_id, count + 1);
			});

			// Build follow stats map (isFollowing will be set to false, will be updated client-side)
			ids.forEach((userId) => {
				followStatsMap.set(userId, {
					isFollowing: false, // Will be updated client-side
					followers: followerCount.get(userId) || 0,
					following: followingCount.get(userId) || 0,
				});
			});
		} catch (error) {
			console.error("Error fetching follow stats:", error);
			// If follow stats fail, continue without them
		}
	}

	const nextCursor =
		data && data.length
			? Buffer.from(
					`${data[data.length - 1].username}|${data[data.length - 1].user_id}`,
				).toString("base64")
			: null;

	const items = (data ?? []).map((r) => ({
		...r,
		banned_until: suspMap.get(r.user_id) ?? null,
		followStats: followStatsMap.get(r.user_id) || {
			isFollowing: false,
			followers: 0,
			following: 0,
		},
	}));

	return sanitizeUsersListResponse({ items, nextCursor });
}
