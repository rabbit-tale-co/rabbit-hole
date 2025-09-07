import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-cookies';


/**
 * Middleware to secure API endpoints
 * Checks JWT token and verifies it in the database
 */
export async function validateAuthToken(): Promise<{ userId: string } | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
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
      return null;
    }

    // 3. Supabase Auth handles session management automatically
    // No need to manually create or update sessions

    return { userId: user.id };
  } catch (error) {
    console.error('Auth validation error:', error);
    return null;
  }
}

/**
 * Middleware wrapper for API routes
 * Automatically checks authentication and adds userId to request
 */
export function withAuth(handler: (request: NextRequest, context: { userId: string }) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await validateAuthToken();

    if (!authResult) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing authentication token' },
        { status: 401 }
      );
    }

    try {
      return await handler(request, { userId: authResult.userId });
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
export async function validateAdminAuth(): Promise<{ userId: string } | null> {
  const authResult = await validateAuthToken();
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
    const authResult = await validateAdminAuth();

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
