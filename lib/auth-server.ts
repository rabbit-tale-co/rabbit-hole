import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabase-admin';
import { verifySupabaseJWT } from '@/lib/jwt-utils';


/**
 * Safe getting user ID from request
 * Checks JWT token and verifies it in the database
 */
export async function getUserIdOrThrow(request: NextRequest): Promise<string> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // 1. Verify JWT token using JWKS endpoint
    const jwtResult = await verifySupabaseJWT(token);
    if (!jwtResult) {
      throw new Error('Invalid or expired token');
    }

    const userId = jwtResult.userId;

    // 2. Check if token is assigned to user in the database
    const { data: profile, error: profileError } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('User not found in database:', profileError);
      throw new Error('User not found in database');
    }

    return userId;
  } catch (error) {
    console.error('Auth error:', error);
    throw new Error('Authentication required');
  }
}

/**
 * Safe getting user ID from cookies
 * Checks JWT token from cookies and verifies it in the database
 */
export async function getUserIdFromCookies(request: NextRequest): Promise<string> {
  try {
    // Get the session from cookies
    const sessionCookie = request.cookies.get('sb-access-token')?.value;
    if (!sessionCookie) {
      throw new Error('No session found in cookies');
    }

    // 1. Verify JWT token using JWKS endpoint
    const jwtResult = await verifySupabaseJWT(sessionCookie);
    if (!jwtResult) {
      throw new Error('Invalid or expired session');
    }

    const userId = jwtResult.userId;

    // 2. Check if token is assigned to user in the database
    const { data: profile, error: profileError } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('User not found in database:', profileError);
      throw new Error('User not found in database');
    }

    return userId;
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
