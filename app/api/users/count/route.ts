import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
	try {
		// Get total count of users
		const { count, error } = await supabaseAdmin
			.from("profiles")
			.select("*", { count: "exact", head: true });

		if (error) {
			console.error("[API] Error fetching users count:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		console.log("[API] Users count fetched successfully:", { count });

		return NextResponse.json({
			count: count || 0,
		});
	} catch (error) {
		console.error("[API] Unexpected error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
