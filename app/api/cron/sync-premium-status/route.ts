import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.SECRET_STRIPE_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Verify cron secret for security
const CRON_SECRET = process.env.CRON_SECRET || 'default-secret';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting premium status sync for all users...');

    // Get all users with premium status
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('user_id, username, is_premium')
      .not('user_id', 'is', null);

    if (profilesError) {
      console.error('[CRON] Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      console.log('[CRON] No profiles found');
      return NextResponse.json({
        success: true,
        message: 'No profiles found',
        processed: 0,
        updated: 0,
        errors: 0
      });
    }

    console.log(`[CRON] Found ${profiles.length} profiles to check`);

    let processed = 0;
    let updated = 0;
    let errors = 0;
    const results = [];

    // Process users in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < profiles.length; i += batchSize) {
      const batch = profiles.slice(i, i + batchSize);

      const batchPromises = batch.map(async (profile) => {
        try {
          const result = await syncUserPremiumStatus(profile.user_id, profile.username);
          processed++;

          if (result.updated) {
            updated++;
          }

          return result;
        } catch (error) {
          console.error(`[CRON] Error syncing user ${profile.user_id}:`, error);
          errors++;
          return {
            userId: profile.user_id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to be nice to Stripe API
      if (i + batchSize < profiles.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[CRON] Sync completed: ${processed} processed, ${updated} updated, ${errors} errors`);

    return NextResponse.json({
      success: true,
      message: 'Premium status sync completed',
      processed,
      updated,
      errors,
      timestamp: new Date().toISOString(),
      results: results.slice(0, 50) // Return first 50 results to avoid huge response
    });

  } catch (error) {
    console.error('[CRON] Fatal error in premium status sync:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function syncUserPremiumStatus(userId: string, username?: string) {
  try {
    // Search for Stripe customer by metadata
    const customers = await stripe.customers.search({
      query: `metadata['user_id']:'${userId}'`,
      limit: 1
    });

    if (customers.data.length === 0) {
      // No customer found, ensure is_premium is false
      const { error } = await supabaseAdmin
        .schema('social_art')
        .from('profiles')
        .update({ is_premium: false })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      return {
        userId,
        username,
        success: true,
        updated: true,
        action: 'set_false_no_customer',
        message: 'No Stripe customer found, set is_premium to false'
      };
    }

    const customer = customers.data[0];

    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    });

    // Find active subscription
    const activeSubscription = subscriptions.data.find(sub =>
      sub.status === 'active' || sub.status === 'trialing'
    );

    const shouldBePremium = activeSubscription ?
      (activeSubscription.status === 'active' || activeSubscription.status === 'trialing') :
      false;

    // Get current status from database
    const { data: currentProfile } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('is_premium')
      .eq('user_id', userId)
      .single();

    const currentPremium = currentProfile?.is_premium || false;

    // Only update if status changed
    if (currentPremium !== shouldBePremium) {
      const { error } = await supabaseAdmin
        .schema('social_art')
        .from('profiles')
        .update({ is_premium: shouldBePremium })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      return {
        userId,
        username,
        success: true,
        updated: true,
        action: shouldBePremium ? 'activated' : 'deactivated',
        previousStatus: currentPremium,
        newStatus: shouldBePremium,
        subscriptionStatus: activeSubscription?.status || 'none',
        message: `Premium status changed from ${currentPremium} to ${shouldBePremium}`
      };
    }

    return {
      userId,
      username,
      success: true,
      updated: false,
      action: 'no_change',
      currentStatus: currentPremium,
      subscriptionStatus: activeSubscription?.status || 'none',
      message: 'No change needed'
    };

  } catch (error) {
    throw error;
  }
}

// GET endpoint for manual testing (without auth for local development)
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'GET method not allowed in production' },
      { status: 405 }
    );
  }

  console.log('[CRON] Manual sync triggered via GET (development only)');

  // Simulate POST request
  const mockRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${CRON_SECRET}`
    }
  });

  return POST(mockRequest);
}
