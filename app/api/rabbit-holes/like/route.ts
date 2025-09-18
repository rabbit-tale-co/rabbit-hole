import { NextRequest, NextResponse } from "next/server";
import { verifySupabaseJWT } from "@/lib/jwt-utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await verifySupabaseJWT(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { rabbit_hole_id, is_liked } = body;

    if (!rabbit_hole_id || typeof is_liked !== "boolean") {
      return NextResponse.json({ error: "rabbit_hole_id and is_liked are required" }, { status: 400 });
    }

    // Check if user is a member of the rabbit hole
    const { data: member } = await supabaseAdmin
      .from("rabbit_hole_members")
      .select("id")
      .eq("rabbit_hole_id", rabbit_hole_id)
      .eq("user_id", user.userId)
      .single();

    if (!member) {
      return NextResponse.json({ error: "User must be a member to like/unlike" }, { status: 403 });
    }

    // Update like status
    const { error } = await supabaseAdmin
      .from("rabbit_hole_members")
      .update({
        is_liked,
        liked_at: is_liked ? new Date().toISOString() : null
      })
      .eq("rabbit_hole_id", rabbit_hole_id)
      .eq("user_id", user.userId);

    if (error) {
      console.error("Error updating like status:", error);
      return NextResponse.json({ error: "Failed to update like status" }, { status: 500 });
    }

    return NextResponse.json({ success: true, is_liked });
  } catch (error) {
    console.error("Error in like rabbit hole API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
