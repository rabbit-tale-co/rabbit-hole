import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get profile from database
    const { data: profile, error: profileError } = await supabase
      .schema('social_art')
      .from('profiles')
      .select('is_premium, username, display_name')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({
      user_id: user.id,
      is_premium: profile?.is_premium || false,
      username: profile?.username,
      display_name: profile?.display_name,
      email: user.email
    });

  } catch (error) {
    console.error('Error in premium-status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
