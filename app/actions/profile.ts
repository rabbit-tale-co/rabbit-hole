"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { UpsertProfile } from "@/schemas/profile";

export async function upsertProfile(input: unknown) {
  const parsed = UpsertProfile.safeParse(input);
  if (!parsed.success) return { error: "Invalid payload" };
  const { error, data } = await supabaseAdmin
    .from("profiles")
    .upsert(
      {
        user_id: parsed.data.user_id,
        username: parsed.data.username,
        display_name: parsed.data.display_name,
        cover_url: parsed.data.cover_url ?? null,
        accent_color: parsed.data.accent_color ?? null,
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  if (error) return { error: error.message };
  return { profile: data };
}
