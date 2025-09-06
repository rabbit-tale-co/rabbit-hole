import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { getSecureUserProfile, logSecureError } from '@/lib/secure-db';

export const GET = withAuth(async (request: NextRequest, { userId }) => {
  try {
    // Get profile from database using secure function
    const profile = await getSecureUserProfile(userId);

    return NextResponse.json({
      user_id: userId,
      is_premium: profile?.is_premium || false,
      username: profile?.username,
      display_name: profile?.display_name,
      email: profile?.email
    });

  } catch (error) {
    logSecureError('premium_status_error', error, userId);
    console.error('Error in premium-status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
