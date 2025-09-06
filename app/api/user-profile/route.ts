import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { getSecureUserProfile, logSecureError } from '@/lib/secure-db';
import { getCustomClaims, getEmailFromToken, getUserMetadataFromToken } from '@/lib/jwt-utils';

/**
 * Przykład API endpoint z custom claims
 * Pokazuje jak używać JWT claims zgodnie z dokumentacją Supabase
 */
export const GET = withAuth(async (request: NextRequest, { userId }) => {
  try {
    // Pobierz token z requestu
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    // Pobierz profil użytkownika z bazy danych
    const profile = await getSecureUserProfile(userId);

    // Pobierz dane z JWT claims
    const email = await getEmailFromToken(token);
    const userMetadata = await getUserMetadataFromToken(token);
    const customClaims = await getCustomClaims(token);

    return NextResponse.json({
      success: true,
      data: {
        // Dane z bazy danych
        profile: {
          userId: profile.user_id,
          username: profile.username,
          displayName: profile.display_name,
          isPremium: profile.is_premium,
        },
        // Dane z JWT claims
        jwt: {
          email,
          userMetadata,
          customClaims,
        }
      }
    });
  } catch (error) {
    logSecureError('get_user_profile_with_claims', error, userId);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get user profile'
      },
      { status: 500 }
    );
  }
});

/**
 * Przykład POST endpoint z walidacją custom claims
 */
export const POST = withAuth(async (request: NextRequest, { userId }) => {
  try {
    const body = await request.json();

    // Pobierz token z requestu
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    // Przykład sprawdzania custom claims
    const { hasCustomClaim } = await import('@/lib/jwt-utils');

    // Sprawdź czy użytkownik ma określone uprawnienia
    const hasAdminClaim = await hasCustomClaim(token, 'is_admin', true);
    const hasSpecialFeature = await hasCustomClaim(token, 'special_feature');

    // Walidacja danych wejściowych
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Przykład logiki biznesowej na podstawie claims
    if (body.action === 'admin_action' && !hasAdminClaim) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (body.action === 'special_feature' && !hasSpecialFeature) {
      return NextResponse.json(
        { success: false, error: 'Special feature access required' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Operation completed successfully',
      permissions: {
        isAdmin: hasAdminClaim,
        hasSpecialFeature,
      }
    });
  } catch (error) {
    logSecureError('user_profile_post', error, userId);

    return NextResponse.json(
      {
        success: false,
        error: 'Operation failed'
      },
      { status: 500 }
    );
  }
});
