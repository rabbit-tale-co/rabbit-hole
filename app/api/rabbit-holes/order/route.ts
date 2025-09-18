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

    // Get user's rabbit hole order
    const { data: orderData, error } = await supabaseAdmin
      .from("rabbit_hole_order")
      .select("order")
      .eq("user_id", user.userId)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 = no rows found
      console.error("Error fetching rabbit hole order:", error);
      return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
    }

    return NextResponse.json({
      order: orderData?.order || []
    });
  } catch (error) {
    console.error("Error in rabbit hole order API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
    const { order } = body;

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: "Order must be an array" }, { status: 400 });
    }

    // Upsert the order
    const { error } = await supabaseAdmin
      .from("rabbit_hole_order")
      .upsert({
        user_id: user.userId,
        order: order,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Error updating rabbit hole order:", error);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in update rabbit hole order API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
