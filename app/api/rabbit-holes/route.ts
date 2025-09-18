import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySupabaseJWT } from "@/lib/jwt-utils";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { validateRules, sanitizeRules } from "@/lib/validation/rabbit-hole-rules";
import { generateAccentColor, getAccentColorValue } from "@/lib/accent-colors";
import { validateUrl, generateUrlFromName, generateUniqueUrl } from "@/lib/utils/url-generator";

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
    const { name, url, description, rules } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate URL from name if not provided
    let finalUrl = url;
    if (!finalUrl || finalUrl.trim().length === 0) {
      finalUrl = generateUrlFromName(name);
    }

    // Validate URL format
    const urlValidation = validateUrl(finalUrl);
    if (!urlValidation.isValid) {
      return NextResponse.json({
        error: "Invalid URL format",
        details: urlValidation.error
      }, { status: 400 });
    }

    // Check if URL is already taken - return error instead of generating new one
    const { data: existingRabbitHole } = await supabaseAdmin
      .from("rabbit_holes")
      .select("id")
      .eq("url", finalUrl)
      .single();

    if (existingRabbitHole) {
      return NextResponse.json({
        error: "A rabbit hole with this URL already exists",
        code: "DUPLICATE_URL"
      }, { status: 409 });
    }

    // Validate rules if provided
    let rulesArray = null;
    if (rules && Array.isArray(rules) && rules.length > 0) {
      // Validate rules
      const validation = validateRules(rules);
      if (!validation.isValid) {
        return NextResponse.json({
          error: "Rules validation failed",
          details: validation.errors
        }, { status: 400 });
      }

      // Sanitize rules
      rulesArray = sanitizeRules(rules);

      if (rulesArray.length === 0) {
        rulesArray = null;
      }
    }

    // Create new rabbit hole
    // Generate accent_color hex like user profile (shade 500)
    const accentName = generateAccentColor(user.userId);
    const accentHex = getAccentColorValue(accentName, 500);
    const { data: rabbitHole, error } = await supabaseAdmin
      .from("rabbit_holes")
      .insert({
        name: name.trim(),
        url: finalUrl,
        description: description?.trim() || null,
        rules: rulesArray,
        owner_id: user.userId,
        accent_color: accentHex,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating rabbit hole:", error);
      console.log("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        constraint: (error as any).constraint
      });

      // Handle specific database errors
      if (error.code === '23505') {
        // Extract constraint name from error message
        const constraintMatch = error.message.match(/constraint "([^"]+)"/);
        const constraint = constraintMatch ? constraintMatch[1] : null;
        console.log("Constraint:", constraint);

        if (constraint === 'rabbit_holes_url_key') {
          return NextResponse.json({
            error: "A rabbit hole with this URL already exists",
            code: "DUPLICATE_URL"
          }, { status: 409 });
        }
      }

      return NextResponse.json({ error: "Failed to create rabbit hole" }, { status: 500 });
    }

    // Revalidate rabbit-holes page to show the new rabbit hole
    revalidatePath("/rabbit-holes");

    return NextResponse.json({
      rabbitHole
    });
  } catch (error) {
    console.error("Error in rabbit holes API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
