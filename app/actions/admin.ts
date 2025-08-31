"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserFromCookies, getUserFromToken } from "@/lib/auth";

async function requireAdmin(token?: string) {
  const me = token ? await getUserFromToken(token) : await getUserFromCookies();
  if (!me) return { error: "Unauthorized" } as const;
  // Server-side check against social_art.profiles.is_admin
  try {
    const { data: prof, error } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('is_admin')
      .eq('user_id', me.id)
      .maybeSingle();
    if (error) return { error: error.message } as const;
    const isAdmin = Boolean((prof as { is_admin?: boolean } | null)?.is_admin);
    if (!isAdmin) return { error: "Forbidden" } as const;
  } catch (e) {
    return { error: (e as Error).message } as const;
  }
  return { me } as const;
}

export async function isCurrentUserAdmin() {
  const me = await getUserFromCookies();
  if (!me) return { admin: false };
  try {
    const { data: prof } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('is_admin')
      .eq('user_id', me.id)
      .maybeSingle();
    const isAdmin = Boolean((prof as { is_admin?: boolean } | null)?.is_admin);
    return { admin: isAdmin };
  } catch {
    return { admin: false };
  }
}

export async function adminDeletePost(post_id: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const { error } = await supabaseAdmin.from("posts").update({ is_deleted: true }).eq("id", post_id);
  if (error) return { error: error.message };
  return { ok: true };
}

// TEMP DEV TOOL: soft-delete all posts
export async function adminDeleteAllPosts() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const { error } = await supabaseAdmin.from("posts").update({ is_deleted: true }).neq("id", "");
  if (error) return { error: error.message };
  return { ok: true };
}

export async function adminBanUser(targetUserId: string, bannedUntilISO: string, reason?: string, note?: string, token?: string) {
  const auth = await requireAdmin(token);
  if ("error" in auth) return auth;
  const { error } = await supabaseAdmin
    .schema('social_art')
    .from("suspended_users")
    .upsert({ user_id: targetUserId, banned_until: bannedUntilISO, reason: reason || null, note: note || null }, { onConflict: 'user_id' });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function adminUnbanUser(targetUserId: string, token?: string) {
  const auth = await requireAdmin(token);
  if ("error" in auth) return auth;
  // Remove suspension entry entirely
  const { error } = await supabaseAdmin
    .schema('social_art')
    .from("suspended_users")
    .delete()
    .eq("user_id", targetUserId);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function adminSetSuperAdmin(targetUserId: string, on: boolean) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      user_metadata: { is_super_admin: on },
    } as Record<string, unknown>);
    if (error) return { error: error.message };
    return { ok: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
