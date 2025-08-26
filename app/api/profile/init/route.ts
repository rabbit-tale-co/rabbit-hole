import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { InitProfile } from "@/schemas/profile";
import { generateAccentColor, getAccentColorValue } from "@/lib/accent-colors";

function sanitizeBaseUsername(input: string): string {
  const base = input.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  if (base.length >= 3) return base;
  return (base + "___").slice(0, 3);
}

async function findUniqueUsername(base: string) {
  let candidate = base;
  let i = 1;
  while (true) {
    const { data, error } = await supabaseAdmin
      .from("social_art.profiles")
      .select("user_id")
      .ilike("username", candidate)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`username check failed: ${error.message}`);
    if (!data) return candidate;
    candidate = `${base}_${i}`;
    if (candidate.length < 3) candidate = (candidate + "___").slice(0, 3);
    i += 1;
    if (i > 1000) throw new Error("could not allocate unique username");
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = InitProfile.safeParse(json);
    if (!parsed.success) return Response.json({ error: "invalid payload" }, { status: 400 });

    const { user_id, meta } = parsed.data;

    // 1) Idempotent: skip if exists
    {
      const { data: existing, error: exErr } = await supabaseAdmin
        .from("profiles")
        .select("user_id")
        .eq("user_id", user_id)
        .maybeSingle();
      if (exErr) return Response.json({ error: exErr.message }, { status: 500 });
      if (existing) return Response.json({ ok: true, skipped: true });
    }

    // 2) Defaults and derivations
    const rawBase = meta?.username || meta?.display_name || `user_${user_id.slice(0, 6)}`;
    const base = sanitizeBaseUsername(rawBase);
    const username = await findUniqueUsername(base);

    const display_name = (meta?.display_name && meta.display_name.trim())
      || username.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

    const accent = meta?.accent_color ?? (() => {
      const name = generateAccentColor(user_id);
      return getAccentColorValue(name, 500);
    })();

    const payload = {
      user_id,
      username,
      display_name,
      is_premium: !!meta?.is_premium,
      avatar_url: meta?.avatar_url ?? null,
      cover_url: meta?.cover_url ?? null,
      accent_color: accent,
    };

    // 3) Insert
    const { error } = await supabaseAdmin
      .from("profiles")
      .insert(payload);
    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "init failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
