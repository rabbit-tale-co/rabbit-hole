import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ACCENT_COLORS, getAccentColorValue } from "@/lib/accent-colors";
import { InitProfile } from "@/schemas/profile";
import { USERNAME } from "@/schemas/_shared";

async function findUniqueUsername(base: string) {
  const candidate = base;
  while (true) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .ilike("username", candidate)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`username check failed: ${error.message}`);
    if (!data) return candidate;
  }
}

async function isUsernameAvailable(candidate: string, excludeUserId?: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("user_id, username")
    .ilike("username", candidate)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`username check failed: ${error.message}`);
  if (!data) return true;
  if (excludeUserId && data.user_id === excludeUserId) return true;
  return false;
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

    // 1) If exists: ensure accent_color is set and optionally apply desired username
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
        const updates: Record<string, unknown> = {};
        // assign random accent if missing
        if (!existing.accent_color) {
          updates.accent_color = pickRandomAccentHex();
        }
        // if caller provided a desired username, try to apply it
        const candidateOk = desiredUsername ? USERNAME.safeParse(desiredUsername).success : false;
        if (candidateOk) {
          const base = String(desiredUsername).toLowerCase();
          if (base !== existing.username?.toLowerCase()) {
            const available = await isUsernameAvailable(base, user_id);
            if (!available) {
              return Response.json({ error: "username_taken" }, { status: 409 });
            }
            updates.username = base;
            // update display_name only if it previously mirrored username
            if (!existing.display_name || existing.display_name.toLowerCase() === (existing.username ?? '').toLowerCase()) {
              updates.display_name = base;
            }
          }
        }
        if (Object.keys(updates).length > 0) {
          const { error: upErr } = await supabaseAdmin
            .from("profiles")
            .update(updates)
            .eq("user_id", user_id);
          if (upErr) {
            console.error("init.update_existing.error", upErr);
            return Response.json({ stage: "update_existing", error: upErr.message, code: (upErr as { code?: string }).code, details: (upErr as { details?: string }).details, hint: (upErr as { hint?: string }).hint }, { status: 500 });
          }
          return Response.json({ ok: true, updated: true, stage: "update_existing", applied: Object.keys(updates) });
        }
        return Response.json({ ok: true, skipped: true, stage: "exists_noop" });
      }
    }

    // 2) Defaults and derivations
    const candidateOk = desiredUsername ? USERNAME.safeParse(desiredUsername).success : false;
    let username: string;
    if (candidateOk && desiredUsername) {
      const base = String(desiredUsername).toLowerCase();
      const available = await isUsernameAvailable(base);
      if (!available) {
        return Response.json({ error: "username_taken" }, { status: 409 });
      }
      username = base;
    } else {
      const base = `user_${user_id.slice(0, 6)}`;
      username = await findUniqueUsername(base);
    }

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
