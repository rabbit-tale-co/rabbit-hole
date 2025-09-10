"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function requireActiveUser(
	expectedUserId?: string,
): Promise<{ error?: string; me?: { id: string } }> {
	// Try to get user from Supabase session first
	const { data: auth } = await supabaseAdmin.auth.getUser();

	if (!auth.user?.id) {
		// If no session, try to get user from client-side context
		try {
			const { supabase } = await import("@/lib/supabase");
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user?.id) return { error: "Unauthorized" };

			if (expectedUserId && user.id !== expectedUserId)
				return { error: "Forbidden" };
			return { me: { id: user.id } };
		} catch (error) {
			console.error("[JWT] Auth error:", error);
			return { error: "Unauthorized" };
		}
	}

	if (expectedUserId && auth.user.id !== expectedUserId)
		return { error: "Forbidden" };

	return { me: { id: auth.user.id } };
}
