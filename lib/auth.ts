import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-cookies";

export async function getUser(): Promise<{ id: string } | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.log(`[AUTH] Authentication failed:`, error?.message || 'No user');
      return null;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('User not found in database:', profileError);
      return null;
    }

    return { id: user.id };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function getUserFromToken(token: string | null | undefined): Promise<{ id: string } | null> {
  if (!token) return null;

  try {
    // For backward compatibility, we'll use the old JWT verification
    const { verifySupabaseJWT } = await import("@/lib/jwt-utils");
    const jwtResult = await verifySupabaseJWT(token);
    if (!jwtResult) return null;

    const userId = jwtResult.userId;

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
