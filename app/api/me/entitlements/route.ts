import { NextRequest, NextResponse } from 'next/server';
import { getUserIdOrThrow } from '@/lib/auth-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = await getUserIdOrThrow(request);

    // Get user's premium status
    const { data: profile, error: profileError } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('is_premium')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      isPremium: profile.is_premium || false
    });
  } catch (error) {
    console.error('Entitlements error:', error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch entitlements' },
      { status: 500 }
    );
  }
}
