import { supabaseAdmin } from "@/lib/supabase-admin";
import { cookies } from "next/headers";

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const parts = header.split(/;\s*/);
  for (const part of parts) {
    const [k, v] = part.split("=");
    if (decodeURIComponent(k) === name) return decodeURIComponent(v ?? "");
  }
  return null;
}

function getBearer(req: Request): string | null {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
  const cookieHeader = req.headers.get("cookie") || req.headers.get("Cookie");
  // common supabase helpers cookie name
  const token = parseCookie(cookieHeader, "sb-access-token");
  return token || null;
}

export async function getUser(req: Request): Promise<{ id: string } | null> {
  const token = getBearer(req);
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return { id: data.user.id };
}

export async function getUserFromCookies(): Promise<
  | null
  | {
      id: string;
      isSuperAdmin: boolean;
      bannedUntil: string | null;
      roles: string[];
    }
> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value || null;
    if (!token) return null;
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return null;
    const u = data.user as { id: string; app_metadata?: { roles?: string[] }; user_metadata?: { is_super_admin?: boolean } };
    const rolesAppMeta: string[] = Array.isArray(u?.app_metadata?.roles) ? (u.app_metadata.roles as string[]) : [];
    let mergedRoles: string[] = rolesAppMeta;
    let isAdminFlag = false;
    // merge admin flag from social_art.profiles
    try {
      const { data: prof } = await supabaseAdmin.schema('social_art').from('profiles').select('is_admin, banned_until').eq('user_id', u.id).maybeSingle();
      const p = prof as { is_admin?: boolean; banned_until?: string | null } | null;
      if (p && p.is_admin) { isAdminFlag = true; mergedRoles = Array.from(new Set([...(mergedRoles || []), 'admin'])); }
    } catch {}
    let isSuperAdmin = Boolean(u?.user_metadata?.is_super_admin) || mergedRoles.includes("admin") || mergedRoles.includes("super_admin");
    try {
      const { data: row } = await supabaseAdmin.schema('auth').from('users').select('is_super_admin').eq('id', u.id).maybeSingle();
      if ((row as { is_super_admin?: boolean } | null)?.is_super_admin === true) isSuperAdmin = true;
    } catch {}
    // banned_until now lives in social_art.profiles
    let bannedUntil: string | null = null;
    try {
      const { data: prof2 } = await supabaseAdmin.schema('social_art').from('profiles').select('banned_until').eq('user_id', u.id).maybeSingle();
      bannedUntil = (prof2 as { banned_until?: string | null } | null)?.banned_until ?? null;
    } catch {}
    return { id: u.id, isSuperAdmin, bannedUntil, roles: mergedRoles };
  } catch {
    return null;
  }
}

export function isBanned(bannedUntil: string | null): boolean {
  if (!bannedUntil) return false;
  const t = Date.parse(bannedUntil);
  if (Number.isNaN(t)) return false;
  return t > Date.now();
}
