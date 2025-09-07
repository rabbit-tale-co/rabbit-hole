import { supabaseAdmin } from './supabase-admin';
import { createClient } from './supabase-cookies';


/**
 * Safe getting user ID from request
 * Checks JWT token from cookies and verifies it in the database
 */
export async function getUserIdOrThrow(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error('Authentication required');
    }

    // 2. Check if token is assigned to user in the database
    const { data: profile, error: profileError } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('User not found in database:', profileError);
      throw new Error('User not found in database');
    }

    return user.id;
  } catch (error) {
    console.error('Auth error:', error);
    throw new Error('Authentication required');
  }
}

/**
 * Safe getting user ID from cookies
 * Checks JWT token from cookies and verifies it in the database
 */
export async function getUserIdFromCookies(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error('No session found in cookies');
    }

    // 2. Check if token is assigned to user in the database
    const { data: profile, error: profileError } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('User not found in database:', profileError);
      throw new Error('User not found in database');
    }

    return user.id;
  } catch (error) {
    console.error('Cookie auth error:', error);
    throw new Error('Authentication required');
  }
}

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string) {
  const { data: profile, error } = await supabaseAdmin
    .schema('social_art')
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error('Profile not found');
  }

  return profile;
}
