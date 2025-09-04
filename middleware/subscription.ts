import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.SECRET_STRIPE_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Routes that require premium access
const PREMIUM_ROUTES = [
  '/premium',
  '/golden-carrot/features',
  // Add more premium routes here
];

// Routes that should check subscription status
const SUBSCRIPTION_CHECK_ROUTES = [
  '/profile',
  '/settings',
];

export async function checkSubscriptionStatus(userId: string) {
  try {
    // console.log(`🔍 [MIDDLEWARE] Checking subscription for user: ${userId}`);

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, stripe_customer_id, is_premium, updated_at')
      .eq('user_id', userId)
      .single();

    // console.log(`🔍 [MIDDLEWARE] Profile data:`, {
    //   user_id: profile?.user_id,
    //   stripe_customer_id: profile?.stripe_customer_id,
    //   is_premium: profile?.is_premium,
    //   updated_at: profile?.updated_at
    // });

    if (profileError || !profile) {
      // console.log(`❌ [MIDDLEWARE] No profile found for user: ${userId}`);
      return { isPremium: false, status: 'no_profile' };
    }

    // If no Stripe customer ID, user is not premium
    if (!profile.stripe_customer_id) {
      // console.log(`❌ [MIDDLEWARE] No stripe_customer_id for user: ${userId}`);
      return { isPremium: false, status: 'no_customer' };
    }

    // Check for manual subscription (starts with 'manual_')
    if (profile.stripe_customer_id.startsWith('manual_')) {
      // console.log(`✅ [MIDDLEWARE] Manual subscription detected for user: ${userId}, is_premium: ${profile.is_premium}`);
      // For manual subscriptions, just return the is_premium status from the database
      return {
        isPremium: profile.is_premium,
        status: profile.is_premium ? 'active' : 'inactive',
        plan: 'manual',
        subscriptionId: 'manual',
      };
    }

    // Check if we have recent subscription data (within last 5 minutes)
    const lastCheck = profile.updated_at;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    if (lastCheck && new Date(lastCheck) > fiveMinutesAgo && profile.is_premium) {
      // Use cached data if recent
      return {
        isPremium: profile.is_premium,
        status: profile.is_premium ? 'active' : 'inactive',
        plan: 'premium',
        subscriptionId: 'manual',
      };
    }

    // Check active subscriptions using Stripe API
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    const activeSubscription = subscriptions.data[0];

    if (!activeSubscription) {
      // console.log(`⚠️ [MIDDLEWARE] No active Stripe subscription found for user: ${userId}`);

      // No active subscription found, but check if it's a manual subscription first
      if (profile.stripe_customer_id && profile.stripe_customer_id.startsWith('manual_')) {
        // console.log(`✅ [MIDDLEWARE] Manual subscription detected in fallback check for user: ${userId}, is_premium: ${profile.is_premium}`);
        // For manual subscriptions, don't reset is_premium
        return {
          isPremium: profile.is_premium,
          status: profile.is_premium ? 'active' : 'inactive',
          plan: 'manual',
          subscriptionId: 'manual',
        };
      }

      // console.log(`❌ [MIDDLEWARE] Resetting is_premium to false for user: ${userId} (no manual subscription detected)`);
      // Only reset for real Stripe subscriptions
      await supabaseAdmin
        .from('profiles')
        .update({
          is_premium: false,
        })
        .eq('user_id', userId);

      return { isPremium: false, status: 'inactive' };
    }

    // Update profile with current subscription data
    const plan = activeSubscription.metadata?.plan || 'unknown';
    await supabaseAdmin
      .from('profiles')
      .update({
        is_premium: activeSubscription.status === 'active',
      })
      .eq('user_id', userId);

    return {
      isPremium: activeSubscription.status === 'active',
      status: activeSubscription.status,
      plan: plan,
      subscriptionId: activeSubscription.id,
    };

  } catch (error) {
    console.error('Subscription status check error:', error);
    return { isPremium: false, status: 'error' };
  }
}

export async function subscriptionMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a premium route
  const isPremiumRoute = PREMIUM_ROUTES.some(route => pathname.startsWith(route));
  const shouldCheckSubscription = SUBSCRIPTION_CHECK_ROUTES.some(route => pathname.startsWith(route));

  if (!isPremiumRoute && !shouldCheckSubscription) {
    return NextResponse.next();
  }

  // Get user from session (you'll need to implement this based on your auth system)
  // For now, we'll skip the middleware and let the frontend handle it
  // This is because middleware runs before the page loads and doesn't have access to React context

  return NextResponse.next();
}

// Alternative: Server-side subscription check for API routes
export async function checkPremiumAccess(userId: string, requiredPlan?: string) {
  const subscription = await checkSubscriptionStatus(userId);

  if (!subscription.isPremium) {
    return {
      hasAccess: false,
      reason: 'no_premium_subscription',
      subscription,
    };
  }

  if (requiredPlan && subscription.plan !== requiredPlan) {
    return {
      hasAccess: false,
      reason: 'insufficient_plan',
      subscription,
    };
  }

  return {
    hasAccess: true,
    subscription,
  };
}
