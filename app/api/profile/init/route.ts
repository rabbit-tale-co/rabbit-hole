import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ACCENT_COLORS, getAccentColorValue } from "@/lib/accent-colors";
import { InitProfile } from "@/schemas/profile";
import { USERNAME } from "@/schemas/_shared";

async function findUniqueUsername(base: string) {
  let candidate = base;
  let i = 1;
  while (true) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
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

    const { user_id, username: desiredUsername } = parsed.data;

    // helper to pick random accent hex
    const pickRandomAccentHex = () => {
      const idx = Math.floor(Math.random() * ACCENT_COLORS.length);
      const name = ACCENT_COLORS[idx];
      return getAccentColorValue(name, 500);
    };

    // 1) If exists: ensure accent_color is set; otherwise insert
    {
      const { data: existing, error: exErr } = await supabaseAdmin
        .from("profiles")
        .select("user_id, accent_color, username, display_name")
        .eq("user_id", user_id)
        .maybeSingle();
      if (exErr) {
        console.error("init.check_existing.error", exErr);
        return Response.json({ stage: "check_existing", error: exErr.message, code: (exErr as { code?: string }).code, details: (exErr as { details?: string }).details, hint: (exErr as { hint?: string }).hint }, { status: 500 });
      }
      if (existing) {
        if (!existing.accent_color) {
          const hex = pickRandomAccentHex();
          const { error: upErr } = await supabaseAdmin
            .from("profiles")
            .update({ accent_color: hex })
            .eq("user_id", user_id);
          if (upErr) {
            console.error("init.update_accent.error", upErr);
            return Response.json({ stage: "update_accent", error: upErr.message, code: (upErr as { code?: string }).code, details: (upErr as { details?: string }).details, hint: (upErr as { hint?: string }).hint }, { status: 500 });
          }
          return Response.json({ ok: true, updated: true, accent_color: hex, stage: "update_accent" });
        }
        return Response.json({ ok: true, skipped: true, stage: "exists_noop" });
      }
    }

    // 2) Defaults and derivations
    const candidateOk = desiredUsername ? USERNAME.safeParse(desiredUsername).success : false;
    const base = candidateOk ? String(desiredUsername).toLowerCase() : `user_${user_id.slice(0, 6)}`;
    const username = await findUniqueUsername(base);

    const display_name = username;

    const accent = pickRandomAccentHex();

    const payload = {
        user_id,
        username,
        display_name,
      is_premium: false,
      avatar_url: null,
      cover_url: null,
      accent_color: accent,
    };

    // 3) Insert
    const { error } = await supabaseAdmin
      .from("profiles")
      .insert(payload);
    if (error) {
      console.error("init.insert_profile.error", error, { payload });
      return Response.json({ stage: "insert_profile", error: error.message, code: (error as { code?: string }).code, details: (error as { details?: string }).details, hint: (error as { hint?: string }).hint, inputSummary: { user_id, username } }, { status: 500 });
    }

    return Response.json({ ok: true, stage: "insert_profile", inputSummary: { user_id, username } });
  } catch (e) {
    console.error("init.catch", e);
    const msg = e instanceof Error ? e.message : "init failed";
    return Response.json({ stage: "catch", error: msg }, { status: 500 });
  }
}
