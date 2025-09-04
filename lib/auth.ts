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

export async function getUserFromCookies(): Promise<{ id: string } | null> {
  try {
    const store = await cookies();
    const token = store.get("sb-access-token")?.value || null;
    if (!token) return null;
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return null;
    return { id: data.user.id };
  } catch {
    return null;
  }
}

export async function getUserFromToken(token: string | null | undefined): Promise<{ id: string } | null> {
  if (!token) return null;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return null;
    return { id: data.user.id };
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
