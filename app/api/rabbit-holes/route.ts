import { NextRequest, NextResponse } from "next/server";
import { verifySupabaseJWT } from "@/lib/jwt-utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    // Get user ID from JWT token
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await verifySupabaseJWT(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user's rabbit holes
    const { data: rabbitHoles, error } = await supabaseAdmin
      .from("rabbit_holes")
      .select("*")
      .eq("owner_id", user.userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching rabbit holes:", error);
      return NextResponse.json({ error: `Failed to fetch rabbit holes: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ rabbitHoles: rabbitHoles || [] });
  } catch (error) {
    console.error("Error in rabbit holes API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get user ID from JWT token
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
    const { name, description, rules } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create new rabbit hole
    const { data: rabbitHole, error } = await supabaseAdmin
      .from("rabbit_holes")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        rules: rules?.trim() || null,
        owner_id: user.userId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating rabbit hole:", error);
      return NextResponse.json({ error: "Failed to create rabbit hole" }, { status: 500 });
    }

    return NextResponse.json({ rabbitHole });
  } catch (error) {
    console.error("Error in rabbit holes API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
