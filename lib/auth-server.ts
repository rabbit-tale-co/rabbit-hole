import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabase-admin';

/**
 * Get the current user's ID from the request
 * This function extracts the user ID from the Supabase session
 */
export async function getUserIdOrThrow(request: NextRequest): Promise<string> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new Error('Invalid or expired token');
    }

    return user.id;
  } catch (error) {
    console.error('Auth error:', error);
    throw new Error('Authentication required');
  }
}

/**
 * Get user ID from request cookies (alternative method)
 * This can be used when the token is stored in cookies
 */
export async function getUserIdFromCookies(request: NextRequest): Promise<string> {
  try {
    // Get the session from cookies
    const sessionCookie = request.cookies.get('sb-access-token')?.value;
    if (!sessionCookie) {
      throw new Error('No session found in cookies');
    }

    // Verify the session with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(sessionCookie);

    if (error || !user) {
      throw new Error('Invalid or expired session');
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
