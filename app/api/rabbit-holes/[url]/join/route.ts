import { NextRequest, NextResponse } from "next/server";
import { joinRabbitHole } from "@/app/actions/rabbit-holes";
import { verifySupabaseJWT } from "@/lib/jwt-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ url: string }> }
) {
  try {
    const { url } = await params;
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await verifySupabaseJWT(token);

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get rabbit hole ID by url
    const { supabaseAdmin } = await import("@/lib/supabase-admin");
    const { data: rabbitHole } = await supabaseAdmin
      .from("rabbit_holes")
      .select("id")
      .eq("url", url)
      .single();

    if (!rabbitHole) {
      return NextResponse.json({ error: "Rabbit hole not found" }, { status: 404 });
    }

    const { error } = await joinRabbitHole(rabbitHole.id);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error joining rabbit hole:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
