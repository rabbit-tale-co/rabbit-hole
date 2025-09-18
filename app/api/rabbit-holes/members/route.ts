import { NextRequest, NextResponse } from "next/server";
import { verifySupabaseJWT } from "@/lib/jwt-utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const rabbitHoleId = searchParams.get("rabbit_hole_id");

    if (!rabbitHoleId) {
      return NextResponse.json({ error: "rabbit_hole_id is required" }, { status: 400 });
    }

    // Get members of the rabbit hole
    const { data: members, error } = await supabaseAdmin
      .from("rabbit_hole_members")
      .select(`
        id,
        role,
        joined_at,
        is_liked,
        liked_at,
        profiles!rabbit_hole_members_user_id_fkey (
          user_id,
          username,
          display_name,
          avatar_url
        )
      `)
      .eq("rabbit_hole_id", rabbitHoleId)
      .order("joined_at", { ascending: false });

    if (error) {
      console.error("Error fetching rabbit hole members:", error);
      return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
    }

    return NextResponse.json({ members: members || [] });
  } catch (error) {
    console.error("Error in rabbit hole members API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const { rabbit_hole_id, role = "member" } = body;

    if (!rabbit_hole_id) {
      return NextResponse.json({ error: "rabbit_hole_id is required" }, { status: 400 });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabaseAdmin
      .from("rabbit_hole_members")
      .select("id")
      .eq("rabbit_hole_id", rabbit_hole_id)
      .eq("user_id", user.userId)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 });
    }

    // Add user as member
    const { data: member, error } = await supabaseAdmin
      .from("rabbit_hole_members")
      .insert({
        rabbit_hole_id,
        user_id: user.userId,
        role
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding member:", error);
      return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Error in add member API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const rabbitHoleId = searchParams.get("rabbit_hole_id");

    if (!rabbitHoleId) {
      return NextResponse.json({ error: "rabbit_hole_id is required" }, { status: 400 });
    }

    // Remove user from rabbit hole
    const { error } = await supabaseAdmin
      .from("rabbit_hole_members")
      .delete()
      .eq("rabbit_hole_id", rabbitHoleId)
      .eq("user_id", user.userId);

    if (error) {
      console.error("Error removing member:", error);
      return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in remove member API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
