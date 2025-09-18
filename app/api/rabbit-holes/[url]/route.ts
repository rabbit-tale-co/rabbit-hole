import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getRabbitHoleByUrl, getRabbitHoleFeedPage } from "@/app/actions/rabbit-holes";
import { verifySupabaseJWT } from "@/lib/jwt-utils";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ url: string }> }
) {
  try {
    const { url } = await params; // url slug
    const { searchParams } = new URL(req.url);
    const take = parseInt(searchParams.get("limit") || "24");
    const cursor = searchParams.get("cursor");

    const { data: rabbitHole, error: rabbitHoleError } = await getRabbitHoleByUrl(url);
    if (rabbitHoleError) {
      return NextResponse.json({ error: rabbitHoleError }, { status: 500 });
    }
    if (!rabbitHole) {
      return NextResponse.json({ error: "Rabbit hole not found" }, { status: 404 });
    }

    const feedRes = await getRabbitHoleFeedPage({
      rabbit_hole_id: rabbitHole.id,
      take,
    });
    if (feedRes.error) {
      return NextResponse.json({ error: feedRes.error }, { status: 500 });
    }

    return NextResponse.json({
      rabbitHole,
      items: feedRes.items || [],
      nextCursor: feedRes.nextCursor ?? null,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ url: string }> }
) {
  try {
    const { url: currentUrl } = await params;
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
    const { name, url, description, rules } = body as {
      name: string;
      url: string;
      description?: string;
      rules?: string[];
    };
    if (!name || !url) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });
    }

    // Resolve slug -> id
    const { data: existingHole, error: loadError } = await supabaseAdmin
      .from("rabbit_holes")
      .select("id, owner_id")
      .eq("url", currentUrl)
      .single();
    if (loadError || !existingHole) {
      return NextResponse.json({ error: "Rabbit hole not found" }, { status: 404 });
    }
    if (existingHole.owner_id !== user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Ensure new URL unique
    const { data: urlConflict } = await supabaseAdmin
      .from("rabbit_holes")
      .select("id")
      .eq("url", url)
      .neq("id", existingHole.id)
      .single();
    if (urlConflict) {
      return NextResponse.json({ error: "URL is already taken" }, { status: 400 });
    }

    const { data: rabbitHole, error } = await supabaseAdmin
      .from("rabbit_holes")
      .update({
        name,
        url,
        description: description || null,
        rules: rules || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingHole.id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: "Failed to update rabbit hole" }, { status: 500 });
    }

    // Revalidate rabbit-holes page to show updated rabbit hole
    revalidatePath("/rabbit-holes");

    return NextResponse.json({ rabbitHole });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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
    // Resolve slug -> id
    const { data: existingHole, error: loadError } = await supabaseAdmin
      .from("rabbit_holes")
      .select("id, owner_id")
      .eq("url", url)
      .single();
    if (loadError || !existingHole) {
      return NextResponse.json({ error: "Rabbit hole not found" }, { status: 404 });
    }
    if (existingHole.owner_id !== user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Clean up dependents to avoid FK violations
    await supabaseAdmin.from("rabbit_hole_members").delete().eq("rabbit_hole_id", existingHole.id);
    await supabaseAdmin.from("rabbit_hole_likes").delete().eq("rabbit_hole_id", existingHole.id);
    await supabaseAdmin.from("posts").update({ rabbit_hole_id: null }).eq("rabbit_hole_id", existingHole.id);

    const { error } = await supabaseAdmin
      .from("rabbit_holes")
      .delete()
      .eq("id", existingHole.id);
    if (error) {
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }

    // Revalidate rabbit-holes page to remove deleted rabbit hole
    revalidatePath("/rabbit-holes");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
