import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Stripe from 'stripe';

interface BillingHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  description: string;
  invoice_url?: string;
}

interface StripeSubscription extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
}

const stripe = new Stripe(process.env.SECRET_STRIPE_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  try {

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('user_id, username, display_name, is_premium')
      .eq('user_id', userId)
      .single();

    console.log('Profile query result:', { profile, profileError, userId });

    if (profileError || !profile) {
      console.log('Profile not found for userId:', userId);
      return NextResponse.json(
        { error: 'User profile not found', userId },
        { status: 404 }
      );
    }

    // Search for Stripe customer by metadata
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
      console.error('Error finding Stripe customer:', error);
    }

    if (!stripeCustomer) {
      return NextResponse.json({
        currentSubscription: null,
        billingHistory: [],
        message: 'No Stripe customer found'
      });
    }

    // Get current subscription
    let currentSubscription = null;
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomer.id,
        status: 'all',
        limit: 1
      });

      if (subscriptions.data.length > 0) {
        const sub = subscriptions.data[0] as StripeSubscription;
        currentSubscription = {
          id: sub.id,
          status: sub.status,
          plan: sub.items.data[0]?.price?.nickname || sub.items.data[0]?.price?.id || 'unknown',
          current_period_start: sub.items.data[0]?.current_period_start ? new Date(sub.items.data[0].current_period_start * 1000).toISOString() : null,
          current_period_end: sub.items.data[0]?.current_period_end ? new Date(sub.items.data[0].current_period_end * 1000).toISOString() : null,
          cancel_at_period_end: sub.cancel_at_period_end,
          canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : undefined,
          cancellation_reason: sub.cancellation_details?.reason || null
        };
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }

    // Get billing history (invoices)
    let billingHistory: BillingHistoryItem[] = [];
    try {
      const invoices = await stripe.invoices.list({
        customer: stripeCustomer.id,
        limit: 20
      });

      billingHistory = invoices.data.map(invoice => ({
        id: invoice.id || '',
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status || 'unknown',
        created: new Date(invoice.created * 1000).toISOString(),
        description: invoice.description || `Invoice for ${invoice.lines.data[0]?.description || 'subscription'}`,
        invoice_url: invoice.invoice_pdf || undefined
      }));
    } catch (error) {
      console.error('Error fetching billing history:', error);
    }



    return NextResponse.json({
      currentSubscription,
      billingHistory,
      customer: {
        id: stripeCustomer.id,
        email: 'email' in stripeCustomer ? stripeCustomer.email : null,
        created: 'created' in stripeCustomer ? new Date(stripeCustomer.created * 1000).toISOString() : null
      }
    });

  } catch (error) {
    console.error('Billing data fetch error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch billing data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
