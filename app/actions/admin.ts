"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserFromCookies, isBanned } from "@/lib/auth";

async function requireAdmin() {
  const me = await getUserFromCookies();
  if (!me) return { error: "Unauthorized" } as const;
  if (isBanned(me.bannedUntil)) return { error: "Banned" } as const;
  const isAdmin = me.isSuperAdmin || me.roles.includes("admin");
  if (!isAdmin) return { error: "Forbidden" } as const;
  return { me } as const;
}

export async function isCurrentUserAdmin() {
  const me = await getUserFromCookies();
  if (!me) return { admin: false };
  return { admin: me.isSuperAdmin || me.roles.includes("admin") || me.roles.includes("super_admin") };
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

export async function adminBanUser(targetUserId: string, bannedUntilISO: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const { error } = await supabaseAdmin
    .schema('social_art')
    .from("profiles")
    .update({ banned_until: bannedUntilISO })
    .eq("user_id", targetUserId);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function adminUnbanUser(targetUserId: string) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const { error } = await supabaseAdmin
    .schema('social_art')
    .from("profiles")
    .update({ banned_until: null })
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
