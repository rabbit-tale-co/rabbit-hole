"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { UpsertProfile } from "@/schemas/profile";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function upsertProfile(input: unknown) {
  const parsed = UpsertProfile.safeParse(input);
  if (!parsed.success) return { error: "Invalid payload" };
  // find old username to revalidate old path if it changes
  let oldUsername: string | null = null;
  {
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("user_id", parsed.data.user_id)
      .maybeSingle();
    oldUsername = (existing?.username as string | undefined) ?? null;
  }
  const { error, data } = await supabaseAdmin
    .from("profiles")
    .upsert(
      {
        user_id: parsed.data.user_id,
        username: parsed.data.username,
        display_name: parsed.data.display_name,
        bio: parsed.data.bio ?? null,
        // nie dotykaj cover_url/accent_color jesli nie przyszly w danych
        ...(parsed.data.cover_url !== undefined ? { cover_url: parsed.data.cover_url } : {}),
        ...(parsed.data.accent_color !== undefined ? { accent_color: parsed.data.accent_color } : {}),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  if (error) return { error: error.message };
  // Revalidate key sciezki, aby UI otrzymal swieze dane (profil i strona uzytkownika)
  try {
    if (data?.username) {
      revalidatePath(`/user/${data.username}`);
    }
    if (oldUsername && oldUsername !== data?.username) {
      revalidatePath(`/user/${oldUsername}`);
    }
    revalidatePath("/");
    // revalidate api endpoint used by client hooks
    if (data?.username) revalidatePath(`/api/users/${data.username}`);
    if (oldUsername && oldUsername !== data?.username) revalidatePath(`/api/users/${oldUsername}`);
  } catch {}
  return { profile: data };
}

export async function deleteAccount(userId: string) {
  const sb = supabaseAdmin;
  // delete reactions and comments first (cascades may help, but do it explicitly)
  // posts: delete by author, bookmarks/likes/reposts/comments tied to user will cascade via FKs
  const tables = [
    { table: "likes", col: "user_id" },
    { table: "bookmarks", col: "user_id" },
    { table: "reposts", col: "user_id" },
    { table: "comments", col: "author_id" },
  ];
  for (const t of tables) {
    const { error } = await sb.from(t.table).delete().eq(t.col, userId);
    if (error) return { error: error.message };
  }

  // delete posts authored by user (will cascade storage references logically if you track paths elsewhere)
  {
    const { error } = await sb.from("posts").delete().eq("author_id", userId);
    if (error) return { error: error.message };
  }

  // delete profile row
  {
    const { error } = await sb.from("profiles").delete().eq("user_id", userId);
    if (error) return { error: error.message };
  }

  // finally remove auth user via admin API
  const { error: authErr } = await sb.auth.admin.deleteUser(userId);
  if (authErr) return { error: authErr.message };
  return { ok: true };
}

export async function getUsersPage(input: unknown) {
  const parsed = z.object({ cursor: z.string().optional(), limit: z.number().int().min(1).max(60).default(24) }).safeParse(input);
  if (!parsed.success) return { error: "Invalid cursor" };

  const sb = supabaseAdmin;
  const cursor = parsed.data.cursor;
  let decoded: { username: string; user_id: string } | null = null;
  if (cursor) {
    try {
      const [username, user_id] = Buffer.from(cursor, "base64").toString("utf8").split("|");
      decoded = { username, user_id };
    } catch { decoded = null; }
  }

  const query = sb
    .schema('social_art')
    .from("profiles")
    .select("user_id, username, display_name, bio, avatar_url, cover_url, accent_color, is_premium")
    .order("username", { ascending: true })
    .order("user_id", { ascending: true })
    .limit(parsed.data.limit);

  if (decoded) {
    // keyset: (username, user_id)
    query.gt("username", decoded.username);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };

  // fetch suspension info for listed users
  const ids = (data ?? []).map(r => r.user_id).filter(Boolean);
  const suspMap = new Map<string, string | null>();
  if (ids.length > 0) {
    const { data: susp } = await sb
      .schema('social_art')
      .from('suspended_users')
      .select('user_id, banned_until')
      .in('user_id', ids);
    for (const row of (susp || []) as { user_id: string; banned_until: string | null }[]) {
      suspMap.set(row.user_id, row.banned_until ?? null);
    }
  }

  const nextCursor = data && data.length
    ? Buffer.from(`${data[data.length - 1].username}|${data[data.length - 1].user_id}`).toString("base64")
    : null;

  const items = (data ?? []).map(r => ({ ...r, banned_until: suspMap.get(r.user_id) ?? null }));
  return { items, nextCursor };
}
