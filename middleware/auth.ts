import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifySupabaseJWT } from '@/lib/jwt-utils';


/**
 * Middleware to secure API endpoints
 * Checks JWT token and verifies it in the database
 */
export async function validateAuthToken(request: NextRequest): Promise<{ userId: string; token: string } | null> {
  try {
    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const sessionCookie = await supabaseAdmin.auth.getSession().then(({ data }) =>
        data.session?.access_token);
      if (sessionCookie) {
        token = sessionCookie;
      }
    }

    if (!token) {
      return null;
    }

    // 1. Verify JWT token using JWKS endpoint
    const jwtResult = await verifySupabaseJWT(token);
    if (!jwtResult) {
      return null;
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
      return null;
    }

    // 3. Supabase Auth handles session management automatically
    // No need to manually create or update sessions

    return { userId, token };
  } catch (error) {
    console.error('Auth validation error:', error);
    return null;
  }
}

/**
 * Middleware wrapper for API routes
 * Automatically checks authentication and adds userId to request
 */
export function withAuth(handler: (request: NextRequest, context: { userId: string; token: string }) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await validateAuthToken(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing authentication token' },
        { status: 401 }
      );
    }

    try {
      return await handler(request, { userId: authResult.userId, token: authResult.token });
    } catch (error) {
      console.error('API handler error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware to check admin privileges
 */
export async function validateAdminAuth(request: NextRequest): Promise<{ userId: string } | null> {
  const authResult = await validateAuthToken(request);
  if (!authResult) return null;

  try {
    // Check if user has admin privileges
    const { data: profile, error } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('is_admin')
      .eq('user_id', authResult.userId)
      .single();

    if (error || !profile || !profile.is_admin) {
      console.error('User is not admin:', error);
      return null;
    }

    return authResult;
  } catch (error) {
    console.error('Admin auth validation error:', error);
    return null;
  }
}

/**
 * Middleware wrapper for admin API routes
 */
export function withAdminAuth(handler: (request: NextRequest, context: { userId: string }) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await validateAdminAuth(request);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    try {
      return await handler(request, { userId: authResult.userId });
    } catch (error) {
      console.error('Admin API handler error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
