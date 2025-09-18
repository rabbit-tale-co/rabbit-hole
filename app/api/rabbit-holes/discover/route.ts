import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get public rabbit holes for discovery
    let query = supabaseAdmin
      .from("rabbit_holes")
      .select("*")
      .eq("is_public", true)
      .order("like_count", { ascending: false })
      .order("member_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: rabbitHoles, error } = await query;

    if (error) {
      console.error("Error fetching discoverable rabbit holes:", error);
      return NextResponse.json({ error: "Failed to fetch rabbit holes" }, { status: 500 });
    }

    // Get owner profiles for all rabbit holes
    const ownerIds = [...new Set((rabbitHoles || []).map(hole => hole.owner_id))];
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, username, display_name")
      .in("user_id", ownerIds);

    const profileMap = new Map();
    (profiles || []).forEach(profile => {
      profileMap.set(profile.user_id, profile);
    });

    // Transform data for frontend
    const discoverableHoles = (rabbitHoles || []).map(hole => {
      const profile = profileMap.get(hole.owner_id);


      return {
        id: hole.id,
        name: hole.name,
        description: hole.description || "",
        creator: profile ? `Feed by @${profile.username}` : `Feed by @user${hole.owner_id.slice(-4)}`,
        likes: hole.like_count || 0,
        members: hole.member_count || 0,
        posts: hole.post_count || 0,
        avatar: hole.avatar_url || undefined,
        accent_color: hole.accent_color, // Add accent_color field
        url: hole.url,
        created_at: hole.created_at
      };
    });

    return NextResponse.json({ rabbitHoles: discoverableHoles });
  } catch (error) {
    console.error("Error in discover rabbit holes API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Generate random colors for rabbit holes
function getRandomColor(): string {
  const colors = [
    "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57",
    "#ff9ff3", "#54a0ff", "#5f27cd", "#00d2d3", "#ff9f43",
    "#10ac84", "#ee5a24", "#0984e3", "#a29bfe", "#fd79a8"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
