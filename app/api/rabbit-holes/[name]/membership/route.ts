import { NextRequest, NextResponse } from "next/server";
import { isMemberOfRabbitHole } from "@/app/actions/rabbit-holes";
import { verifySupabaseJWT } from "@/lib/jwt-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params;
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await verifySupabaseJWT(token);

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get rabbit hole ID
    const { supabaseAdmin } = await import("@/lib/supabase-admin");
    const { data: rabbitHole } = await supabaseAdmin
      .from("rabbit_holes")
      .select("id")
      .eq("name", name)
      .single();

    if (!rabbitHole) {
      return NextResponse.json({ error: "Rabbit hole not found" }, { status: 404 });
    }

    const { isMember } = await isMemberOfRabbitHole(rabbitHole.id, user.userId);

    return NextResponse.json({ isMember });
  } catch (error) {
    console.error("[API] Error checking membership:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
