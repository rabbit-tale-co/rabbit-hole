import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Bezpieczne utility do wykonywania zapytań do bazy danych
 * Zapobiega SQL injection poprzez używanie parametrów
 */

/**
 * Bezpieczne pobieranie profilu użytkownika
 */
export async function getSecureUserProfile(userId: string) {
	try {
		const { data, error } = await supabaseAdmin
			.schema("social_art")
			.from("profiles")
			.select("*")
			.eq("user_id", userId)
			.single();

		if (error) {
			console.error("Database error getting user profile:", error);
			throw new Error("Failed to get user profile");
		}

		return data;
	} catch (error) {
		console.error("Secure DB error:", error);
		throw new Error("Database operation failed");
	}
}

/**
 * Bezpieczne pobieranie listy użytkowników z paginacją
 */
export async function getSecureUsersList(
	limit: number = 20,
	offset: number = 0,
) {
	try {
		const { data, error } = await supabaseAdmin
			.schema("social_art")
			.from("profiles")
			.select("*")
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			console.error("Database error getting users list:", error);
			throw new Error("Failed to get users list");
		}

		return data;
	} catch (error) {
		console.error("Secure DB error:", error);
		throw new Error("Database operation failed");
	}
}

/**
 * Bezpieczne wyszukiwanie użytkowników po username
 */
export async function searchSecureUsers(query: string, limit: number = 20) {
	try {
		// Sanityzacja query - usuń niebezpieczne znaki
		const sanitizedQuery = query.replace(/[^a-zA-Z0-9_-]/g, "");

		if (sanitizedQuery.length < 2) {
			throw new Error("Query too short");
		}

		const { data, error } = await supabaseAdmin
			.schema("social_art")
			.from("profiles")
			.select("*")
			.ilike("username", `%${sanitizedQuery}%`)
			.limit(limit);

		if (error) {
			console.error("Database error searching users:", error);
			throw new Error("Failed to search users");
		}

		return data;
	} catch (error) {
		console.error("Secure DB error:", error);
		throw new Error("Database operation failed");
	}
}

/**
 * Bezpieczne pobieranie postów użytkownika
 */
export async function getSecureUserPosts(
	userId: string,
	limit: number = 20,
	offset: number = 0,
) {
	try {
		const { data, error } = await supabaseAdmin
			.schema("social_art")
			.from("posts")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			console.error("Database error getting user posts:", error);
			throw new Error("Failed to get user posts");
		}

		return data;
	} catch (error) {
		console.error("Secure DB error:", error);
		throw new Error("Database operation failed");
	}
}

/**
 * Bezpieczne sprawdzanie czy użytkownik jest zbanowany
 */
export async function isUserBanned(userId: string): Promise<boolean> {
	try {
		const { data, error } = await supabaseAdmin
			.schema("social_art")
			.from("profiles")
			.select("banned_until")
			.eq("user_id", userId)
			.single();

		if (error) {
			console.error("Database error checking ban status:", error);
			return false; // Jeśli nie można sprawdzić, nie blokuj użytkownika
		}

		if (!data?.banned_until) return false;

		const banUntil = Date.parse(data.banned_until);
		return !Number.isNaN(banUntil) && banUntil > Date.now();
	} catch (error) {
		console.error("Secure DB error:", error);
		return false;
	}
}

/**
 * Bezpieczne sprawdzanie uprawnień administratora
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
	try {
		const { data, error } = await supabaseAdmin
			.schema("social_art")
			.from("profiles")
			.select("is_admin")
			.eq("user_id", userId)
			.single();

		if (error) {
			console.error("Database error checking admin status:", error);
			return false;
		}

		return Boolean(data?.is_admin);
	} catch (error) {
		console.error("Secure DB error:", error);
		return false;
	}
}

/**
 * Bezpieczne logowanie błędów bez narażania na SQL injection
 */
export function logSecureError(
	operation: string,
	error: unknown,
	userId?: string,
) {
	const errorMessage = error instanceof Error ? error.message : "Unknown error";
	const logData = {
		operation,
		error: errorMessage,
		userId: userId || "unknown",
		timestamp: new Date().toISOString(),
	};

	console.error("Secure error log:", JSON.stringify(logData));
}

/**
 * Sanityzacja stringów przed zapisem do bazy danych
 */
export function sanitizeString(
	input: string,
	maxLength: number = 1000,
): string {
	if (typeof input !== "string") return "";

	return input
		.slice(0, maxLength)
		.replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Usuń kontrolne znaki
		.trim();
}

/**
 * Walidacja UUID
 */
export function isValidUUID(uuid: string): boolean {
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(uuid);
}
