import Stripe from 'stripe';
import { supabaseAdmin } from '../supabase-admin';

/**
 * Ensure customer ID is linked to user profile
 */
export async function ensureCustomerOnProfile(userId: string, stripeCustomerId: string): Promise<void> {
  try {
    // Check if profile already has a stripe_customer_id
    const { data: profile, error: fetchError } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch profile: ${fetchError.message}`);
    }

    // Only update if stripe_customer_id is empty
    if (!profile.stripe_customer_id) {
      const { error: updateError } = await supabaseAdmin
        .schema('social_art')
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(`Failed to update profile with customer ID: ${updateError.message}`);
      }

      console.log(`✅ Linked Stripe customer ${stripeCustomerId} to user ${userId}`);
    } else {
      console.log(`ℹ️  User ${userId} already has customer ID: ${profile.stripe_customer_id}`);
    }
  } catch (error) {
    console.error('Error in ensureCustomerOnProfile:', error);
    throw error;
  }
}

/**
 * Upsert subscription data into the database
 */
export async function upsertSubscription(subscription: Stripe.Subscription): Promise<void> {
  try {
    console.log(`📝 Upserting subscription ${subscription.id} for customer ${subscription.customer}`);

    // Extract user_id from metadata or find by stripe_customer_id
    let userId = subscription.metadata?.user_id;

    if (!userId) {
      // Try to find user by stripe_customer_id
      const { data: profile, error: profileError } = await supabaseAdmin
        .schema('social_art')
        .from('profiles')
        .select('user_id')
        .eq('stripe_customer_id', subscription.customer as string)
        .single();

      if (profileError || !profile) {
        throw new Error(`No user found for customer ${subscription.customer}`);
      }

      userId = profile.user_id;
    }

    // Prepare subscription data
    const subscriptionData = {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      product_id: subscription.items.data[0]?.price?.product as string || null,
      price_id: subscription.items.data[0]?.price?.id || null,
      status: subscription.status,
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: new Date((subscription as Stripe.Subscription & { current_period_start: number }).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000).toISOString(),
      collection_method: subscription.collection_method || null,
      pause_collection: subscription.pause_collection || null,
      latest_invoice: subscription.latest_invoice as string || null,
      raw: subscription as unknown as Record<string, unknown>,
    };

    // Upsert the subscription
    const { error: upsertError } = await supabaseAdmin
      .schema('social_art')
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'stripe_subscription_id',
        ignoreDuplicates: false,
      });

    if (upsertError) {
      throw new Error(`Failed to upsert subscription: ${upsertError.message}`);
    }

    // Ensure customer is linked to profile
    await ensureCustomerOnProfile(userId, subscription.customer as string);

    // Call the database function to recompute premium status as a safety net
    const { error: recomputeError } = await supabaseAdmin
      .rpc('recompute_is_premium', { p_user_id: userId });

    if (recomputeError) {
      console.warn(`⚠️  Failed to recompute premium status: ${recomputeError.message}`);
    } else {
      console.log(`✅ Premium status recomputed for user ${userId}`);
    }

    console.log(`✅ Subscription ${subscription.id} upserted successfully`);
  } catch (error) {
    console.error('Error in upsertSubscription:', error);
    throw error;
  }
}

/**
 * Get subscription by Stripe subscription ID
 */
export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const { data: subscription, error } = await supabaseAdmin
    .schema('social_art')
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single();

  if (error) {
    throw new Error(`Subscription not found: ${error.message}`);
  }

  return subscription;
}

/**
 * Get user's active subscription
 */
export async function getUserActiveSubscription(userId: string) {
  const { data: subscription, error } = await supabaseAdmin
    .schema('social_art')
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get user subscription: ${error.message}`);
  }

  return subscription;
}

/**
 * Check if webhook event has already been processed
 */
export async function isEventProcessed(eventId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .schema('social_art')
    .from('stripe_events')
    .select('event_id')
    .eq('event_id', eventId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Failed to check event status: ${error.message}`);
  }

  return !!data;
}

/**
 * Mark webhook event as processed
 */
export async function markEventAsProcessed(eventId: string, eventType: string): Promise<void> {
  const { error } = await supabaseAdmin
    .schema('social_art')
    .from('stripe_events')
    .upsert({
      event_id: eventId,
      event_type: eventType,
      processed: true,
      processed_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(`Failed to mark event as processed: ${error.message}`);
  }
}
