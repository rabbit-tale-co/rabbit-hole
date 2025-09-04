import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // Parse the webhook event from Stripe
    let event: {
      type: string;
      data: {
        object: Record<string, unknown>;
      };
    };

    try {
      // For Stripe wrapper, we'll parse the event directly
      event = JSON.parse(body);
    } catch (err) {
      console.error('Failed to parse webhook body:', err);
      return NextResponse.json(
        { error: 'Invalid webhook body' },
        { status: 400 }
      );
    }

    console.log('=== STRIPE WEBHOOK RECEIVED ===');
    console.log('Event type:', event.type);
    console.log('Event ID:', event.data.object.id || 'unknown');
    console.log('Created:', event.data.object.created ? new Date(event.data.object.created as number * 1000).toISOString() : 'unknown');
    console.log('Webhook event data:', JSON.stringify(event.data, null, 2));
    console.log('================================');

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }

      // Additional events for better coverage
      case 'invoice.payment_action_required': {
        const invoice = event.data.object;
        await handlePaymentActionRequired(invoice);
        break;
      }

      case 'customer.subscription.paused': {
        const subscription = event.data.object;
        await handleSubscriptionPaused(subscription);
        break;
      }

      case 'customer.subscription.resumed': {
        const subscription = event.data.object;
        await handleSubscriptionResumed(subscription);
        break;
      }

      case 'invoice.upcoming': {
        const invoice = event.data.object;
        await handleInvoiceUpcoming(invoice);
        break;
      }

      default:
        console.log(`⚠️  Unhandled event type: ${event.type}`);
        console.log('Event data:', JSON.stringify(event.data, null, 2));
    }

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ WEBHOOK ERROR:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Record<string, unknown>) {
  console.log('--- HANDLING CHECKOUT COMPLETED ---');
  console.log('Session ID:', session.id);

  const metadata = session.metadata as Record<string, unknown> | undefined;
  const userId = metadata?.user_id as string | undefined;
  const plan = metadata?.plan as string | undefined;

  console.log('Metadata:', metadata);
  console.log('User ID:', userId);
  console.log('Plan:', plan);

  if (!userId || !plan) {
    console.error('❌ Missing metadata in checkout session:', session.id);
    console.error('Required: userId and plan');
    return;
  }

  console.log(`✅ Checkout completed for user ${userId}, plan: ${plan}`);

  try {
    // Update user's premium status
    const { error } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .update({
        is_premium: true,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Failed to update premium status:', error);
    } else {
      console.log(`✅ Premium status updated to true for user ${userId}`);
    }
  } catch (error) {
    console.error('❌ Exception in handleCheckoutCompleted:', error);
  }

  console.log('--- CHECKOUT COMPLETED HANDLED ---');
}

async function handleSubscriptionUpdate(subscription: Record<string, unknown>) {
  console.log('--- HANDLING SUBSCRIPTION UPDATE ---');
  console.log('Subscription ID:', subscription.id);
  console.log('Status:', subscription.status);

  const metadata = subscription.metadata as Record<string, unknown> | undefined;
  const userId = metadata?.user_id as string | undefined;

  console.log('Metadata:', metadata);
  console.log('User ID:', userId);

  if (!userId) {
    console.error('❌ Missing user_id in subscription metadata:', subscription.id);
    return;
  }

  console.log(`✅ Subscription updated for user ${userId}, status: ${subscription.status}`);

  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  console.log('Should be premium:', isActive);

  try {
    // Only update is_premium column since other Stripe columns don't exist yet
    const { error } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .update({
        is_premium: isActive,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Failed to update premium status:', error);
    } else {
      console.log(`✅ Premium status updated to ${isActive} for user ${userId}`);
    }
  } catch (error) {
    console.error('❌ Exception in handleSubscriptionUpdate:', error);
  }

  console.log('--- SUBSCRIPTION UPDATE HANDLED ---');
}

async function handleSubscriptionDeleted(subscription: Record<string, unknown>) {
  console.log('--- HANDLING SUBSCRIPTION DELETED ---');
  console.log('Subscription ID:', subscription.id);
  console.log('Status:', subscription.status);

  const metadata = subscription.metadata as Record<string, unknown> | undefined;
  const userId = metadata?.user_id as string | undefined;

  console.log('Metadata:', metadata);
  console.log('User ID:', userId);

  if (!userId) {
    console.error('❌ Missing user_id in subscription metadata:', subscription.id);
    return;
  }

  console.log(`✅ Subscription deleted for user ${userId}`);

  try {
    // Only update is_premium column since other Stripe columns don't exist yet
    const { error } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .update({
        is_premium: false,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Failed to update premium status:', error);
    } else {
      console.log(`✅ Premium status updated to false for user ${userId}`);
    }
  } catch (error) {
    console.error('❌ Exception in handleSubscriptionDeleted:', error);
  }

  console.log('--- SUBSCRIPTION DELETED HANDLED ---');
}

async function handlePaymentSucceeded(invoice: Record<string, unknown>) {
  console.log('--- HANDLING PAYMENT SUCCEEDED ---');
  console.log('Invoice ID:', invoice.id);
  console.log('Amount:', invoice.amount_paid);
  console.log('Currency:', invoice.currency);

  const subscriptionId = invoice.subscription;
  console.log('Subscription ID:', subscriptionId);

  if (!subscriptionId) {
    console.log('❌ No subscription ID in invoice');
    return;
  }

  try {
    // Get subscription details using Stripe wrapper
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('stripe.subscriptions')
      .select('metadata')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      console.error('❌ Failed to get subscription:', subError);
      return;
    }

    const userId = subscription.metadata?.user_id;
    console.log('User ID from subscription:', userId);

    if (!userId) {
      console.log('❌ No user_id in subscription metadata');
      return;
    }

    console.log(`✅ Payment succeeded for user ${userId}`);

    // Ensure user is marked as premium
    const { error } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .update({
        is_premium: true,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Failed to update premium status:', error);
    } else {
      console.log(`✅ Premium status updated to true for user ${userId}`);
    }
  } catch (error) {
    console.error('❌ Exception in handlePaymentSucceeded:', error);
  }

  console.log('--- PAYMENT SUCCEEDED HANDLED ---');
}

async function handlePaymentFailed(invoice: Record<string, unknown>) {
  console.log('--- HANDLING PAYMENT FAILED ---');
  console.log('Invoice ID:', invoice.id);
  console.log('Amount:', invoice.amount_due);
  console.log('Currency:', invoice.currency);

  const subscriptionId = invoice.subscription;
  console.log('Subscription ID:', subscriptionId);

  if (!subscriptionId) {
    console.log('❌ No subscription ID in invoice');
    return;
  }

  try {
    // Get subscription details using Stripe wrapper
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('stripe.subscriptions')
      .select('metadata')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      console.error('❌ Failed to get subscription:', subError);
      return;
    }

    const userId = subscription.metadata?.user_id;
    console.log('User ID from subscription:', userId);

    if (!userId) {
      console.log('❌ No user_id in subscription metadata');
      return;
    }

    console.log(`✅ Payment failed for user ${userId}`);

    // Update status to indicate payment issue - just set is_premium to false for now
    const { error } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .update({
        is_premium: false,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Failed to update premium status:', error);
    } else {
      console.log(`✅ Premium status updated to false for user ${userId}`);
    }
  } catch (error) {
    console.error('❌ Exception in handlePaymentFailed:', error);
  }

  console.log('--- PAYMENT FAILED HANDLED ---');
}

async function handlePaymentActionRequired(invoice: Record<string, unknown>) {
  console.log('--- HANDLING PAYMENT ACTION REQUIRED ---');
  console.log('Invoice ID:', invoice.id);
  console.log('Amount:', invoice.amount_due);
  console.log('Currency:', invoice.currency);

  const subscriptionId = invoice.subscription;
  console.log('Subscription ID:', subscriptionId);

  if (!subscriptionId) {
    console.log('❌ No subscription ID in invoice');
    return;
  }

  try {
    // Get subscription details using Stripe wrapper
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('stripe.subscriptions')
      .select('metadata')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      console.error('❌ Failed to get subscription:', subError);
      return;
    }

    const userId = subscription.metadata?.user_id;
    console.log('User ID from subscription:', userId);

    if (!userId) {
      console.log('❌ No user_id in subscription metadata');
      return;
    }

    console.log(`✅ Payment action required for user ${userId}`);
    console.log('ℹ️  Keeping premium access - user has grace period to update payment method');

    // Keep premium access but log the issue
    // User has grace period to update payment method
  } catch (error) {
    console.error('❌ Exception in handlePaymentActionRequired:', error);
  }

  console.log('--- PAYMENT ACTION REQUIRED HANDLED ---');
}

async function handleSubscriptionPaused(subscription: Record<string, unknown>) {
  console.log('--- HANDLING SUBSCRIPTION PAUSED ---');
  console.log('Subscription ID:', subscription.id);
  console.log('Status:', subscription.status);

  const metadata = subscription.metadata as Record<string, unknown> | undefined;
  const userId = metadata?.user_id as string | undefined;

  console.log('Metadata:', metadata);
  console.log('User ID:', userId);

  if (!userId) {
    console.error('❌ Missing user_id in subscription metadata:', subscription.id);
    return;
  }

  console.log(`✅ Subscription paused for user ${userId}`);

  try {
    // Paused subscription = no premium access
    const { error } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .update({
        is_premium: false,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Failed to update premium status:', error);
    } else {
      console.log(`✅ Premium status updated to false for user ${userId}`);
    }
  } catch (error) {
    console.error('❌ Exception in handleSubscriptionPaused:', error);
  }

  console.log('--- SUBSCRIPTION PAUSED HANDLED ---');
}

async function handleSubscriptionResumed(subscription: Record<string, unknown>) {
  console.log('--- HANDLING SUBSCRIPTION RESUMED ---');
  console.log('Subscription ID:', subscription.id);
  console.log('Status:', subscription.status);

  const metadata = subscription.metadata as Record<string, unknown> | undefined;
  const userId = metadata?.user_id as string | undefined;

  console.log('Metadata:', metadata);
  console.log('User ID:', userId);

  if (!userId) {
    console.error('❌ Missing user_id in subscription metadata:', subscription.id);
    return;
  }

  console.log(`✅ Subscription resumed for user ${userId}`);

  try {
    // Resumed subscription = premium access restored
    const { error } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .update({
        is_premium: true,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Failed to update premium status:', error);
    } else {
      console.log(`✅ Premium status updated to true for user ${userId}`);
    }
  } catch (error) {
    console.error('❌ Exception in handleSubscriptionResumed:', error);
  }

  console.log('--- SUBSCRIPTION RESUMED HANDLED ---');
}

async function handleInvoiceUpcoming(invoice: Record<string, unknown>) {
  console.log('--- HANDLING INVOICE UPCOMING ---');
  console.log('Invoice ID:', invoice.id);
  console.log('Amount:', invoice.amount_due);
  console.log('Currency:', invoice.currency);
  console.log('Due date:', invoice.due_date);

  const subscriptionId = invoice.subscription;
  console.log('Subscription ID:', subscriptionId);

  if (!subscriptionId) {
    console.log('❌ No subscription ID in invoice');
    return;
  }

  try {
    // Get subscription details using Stripe wrapper
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('stripe.subscriptions')
      .select('metadata')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      console.error('❌ Failed to get subscription:', subError);
      return;
    }

    const userId = subscription.metadata?.user_id;
    console.log('User ID from subscription:', userId);

    if (!userId) {
      console.log('❌ No user_id in subscription metadata');
      return;
    }

    console.log(`✅ Upcoming invoice for user ${userId}`);
    console.log('ℹ️  This is just a notification - no action needed');
    console.log('ℹ️  Could be used to send email reminders');

    // This is just a notification - no action needed
    // Could be used to send email reminders
  } catch (error) {
    console.error('❌ Exception in handleInvoiceUpcoming:', error);
  }

  console.log('--- INVOICE UPCOMING HANDLED ---');
}
