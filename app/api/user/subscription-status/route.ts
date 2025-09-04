import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getUser } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.SECRET_STRIPE_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user profile from social_art schema
    const { data: profile, error: profileError } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('user_id, username, display_name, is_premium')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('User profile not found for userId:', userId);
      console.error('Profile error details:', profileError);
      return NextResponse.json(
        { error: 'User profile not found', details: profileError?.message },
        { status: 404 }
      );
    }

    let stripeCustomer = null;
    try {
      // Search for customers by metadata
      const customers = await stripe.customers.search({
        query: `metadata['user_id']:'${userId}'`,
        limit: 1
      });

      if (customers.data.length > 0) {
        stripeCustomer = customers.data[0];
        // console.log('Found Stripe customer:', { id: stripeCustomer.id, email: stripeCustomer.email });
      } else {
        console.log('No Stripe customer found for user_id:', userId);
      }
    } catch (error) {
      console.error('Error searching for Stripe customer:', error);
    }

    if (!stripeCustomer) {
      console.log('No Stripe customer found, returning basic profile info');
      return NextResponse.json({
        isPremium: profile.is_premium || false,
        subscriptionStatus: 'none',
        plan: null,
        nextBillingDate: null,
        customerId: null,
        subscriptionId: null,
        lastChecked: new Date().toISOString(),
        profile: {
          username: profile.username,
          display_name: profile.display_name,
          is_premium: profile.is_premium || false,
        },
        message: 'No Stripe customer found - using profile is_premium status'
      });
    }

    // Get subscriptions directly from Stripe API
    // console.log('Fetching subscriptions for customer:', stripeCustomer.id);

    let subscriptions: Stripe.Subscription[] = [];
    try {
      const subs = await stripe.subscriptions.list({
        customer: stripeCustomer.id,
        status: 'all',
        limit: 10
      });
      subscriptions = subs.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }

    if (subscriptions.length === 0) {
      return NextResponse.json({
        isPremium: profile.is_premium || false,
        subscriptionStatus: 'none',
        plan: null,
        nextBillingDate: null,
        customerId: stripeCustomer.id,
        subscriptionId: null,
        lastChecked: new Date().toISOString(),
        profile: {
          username: profile.username,
          display_name: profile.display_name,
          is_premium: profile.is_premium || false,
        },
        message: 'No subscriptions found'
      });
    }

    // Find the most recent active subscription
    const activeSubscription = subscriptions.find(sub =>
      sub.status === 'active' || sub.status === 'trialing'
    );

    // console.log('🔍 Subscription analysis:', {
    //   totalSubscriptions: subscriptions.length,
    //   subscriptionStatuses: subscriptions.map(sub => ({ id: sub.id, status: sub.status, priceId: sub.items.data[0]?.price?.id })),
    //   activeSubscription: activeSubscription ? { id: activeSubscription.id, status: activeSubscription.status } : null
    // });

    if (!activeSubscription) {
      return NextResponse.json({
        isPremium: profile.is_premium || false,
        subscriptionStatus: 'inactive',
        plan: null,
        nextBillingDate: null,
        customerId: stripeCustomer.id,
        subscriptionId: null,
        lastChecked: new Date().toISOString(),
        profile: {
          username: profile.username,
          display_name: profile.display_name,
          is_premium: profile.is_premium || false,
        },
        message: 'No active subscriptions found'
      });
    }

    const isActive = activeSubscription.status === 'active' || activeSubscription.status === 'trialing';

    // Get plan details from the subscription
    let planName = 'unknown';
    if (activeSubscription.items.data.length > 0) {
      const price = activeSubscription.items.data[0].price;
      planName = price.nickname || price.id;

      // Map Stripe price IDs to our plan names
      const priceIdToPlan: Record<string, string> = {
        [process.env.STRIPE_DAY_PRICE_ID || '']: 'day',
        [process.env.STRIPE_MONTHLY_PRICE_ID || '']: 'monthly',
        [process.env.STRIPE_YEARLY_PRICE_ID || '']: 'yearly'
      };

      planName = priceIdToPlan[price.id] || 'unknown';

      console.log('🔍 Plan mapping:', { priceId: price.id, planName, nickname: price.nickname });
    }

    // Update profile with current subscription status
    await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .update({
        is_premium: isActive,
      })
      .eq('user_id', userId);

    return NextResponse.json({
      isPremium: isActive,
      subscriptionStatus: activeSubscription.status,
      plan: planName,
      nextBillingDate: activeSubscription.items.data[0].current_period_end ? new Date(activeSubscription.items.data[0].current_period_end * 1000).toISOString() : null,
      customerId: stripeCustomer.id,
      subscriptionId: activeSubscription.id,
      lastChecked: new Date().toISOString(),
      profile: {
        username: profile.username,
        display_name: profile.display_name,
        is_premium: isActive,
      },
      message: 'Subscription status updated from Stripe API'
    });

  } catch (error) {
    console.error('Subscription status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}

// POST endpoint to force refresh subscription status
export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const user = await getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('user_id, is_premium')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Search for Stripe customer
    let stripeCustomer = null;
    try {
      const customers = await stripe.customers.search({
        query: `metadata['user_id']:'${userId}'`,
        limit: 1
      });

      if (customers.data.length > 0) {
        stripeCustomer = customers.data[0];
      }
    } catch (error) {
      console.error('Error searching for Stripe customer:', error);
    }

    if (!stripeCustomer) {
      return NextResponse.json({
        success: true,
        isPremium: false,
        subscriptionStatus: 'none',
        plan: null,
        lastUpdated: new Date().toISOString(),
        message: 'No Stripe customer found'
      });
    }

    // Force refresh by checking all subscription statuses
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomer.id,
      limit: 10,
    });

    const activeSubscription = subscriptions.data.find(sub => sub.status === 'active');
    const latestSubscription = subscriptions.data[0]; // Most recent

    const isActive = activeSubscription?.status === 'active' || activeSubscription?.status === 'trialing';

    // Update profile with current subscription status
    await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .update({
        is_premium: isActive,
      })
      .eq('user_id', userId);

    return NextResponse.json({
      success: true,
      isPremium: isActive,
      subscriptionStatus: activeSubscription?.status || latestSubscription?.status || 'inactive',
      plan: activeSubscription?.items?.data?.[0]?.price?.nickname || 'unknown',
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Force refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh subscription status' },
      { status: 500 }
    );
  }
}
