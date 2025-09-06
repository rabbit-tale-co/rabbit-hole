import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifySupabaseJWT } from "@/lib/jwt-utils";

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


/**
 * Bezpieczna autentykacja z walidacją JWT i sprawdzaniem w bazie danych
 * Sprawdza czy token należy do użytkownika w bazie danych
 */
export async function getUser(req: Request): Promise<{ id: string } | null> {
  const token = getBearer(req);
  console.log(`[AUTH] Token found: ${token ? 'YES' : 'NO'}`);
  if (!token) return null;

  try {
    // 1. Weryfikuj JWT token używając JWKS endpoint
    const jwtResult = await verifySupabaseJWT(token);
    if (!jwtResult) return null;

    const userId = jwtResult.userId;

    // 2. Sprawdź czy token jest przypisany do użytkownika w bazie danych
    const { data: profile, error: profileError } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('User not found in database:', profileError);
      return null;
    }

    return { id: userId };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

/**
 * Bezpieczna autentykacja z tokenu z walidacją JWT i sprawdzaniem w bazie danych
 */
export async function getUserFromToken(token: string | null | undefined): Promise<{ id: string } | null> {
  if (!token) return null;

  try {
    // 1. Weryfikuj JWT token używając JWKS endpoint
    const jwtResult = await verifySupabaseJWT(token);
    if (!jwtResult) return null;

    const userId = jwtResult.userId;

    // 2. Sprawdź czy token jest przypisany do użytkownika w bazie danych
    const { data: profile, error: profileError } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('User not found in database:', profileError);
      return null;
    }

    return { id: userId };
  } catch (error) {
    console.error('Token auth error:', error);
    return null;
  }
}

export function isBanned(bannedUntil: string | null): boolean {
  if (!bannedUntil) return false;
  const t = Date.parse(bannedUntil);
  if (Number.isNaN(t)) return false;
  return t > Date.now();
}
