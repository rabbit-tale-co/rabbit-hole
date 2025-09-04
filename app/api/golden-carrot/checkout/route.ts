import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.SECRET_STRIPE_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const PRICE_IDS = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
  yearly: process.env.STRIPE_YEARLY_PRICE_ID!,
  day: process.env.STRIPE_DAY_PRICE_ID, // Debug $0.99 - optional
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const plan = formData.get('plan') as 'monthly' | 'yearly' | 'day';
    const userId = formData.get('userId') as string;
    const email = formData.get('email') as string;

    if (!plan || !userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!PRICE_IDS[plan]) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Validate price ID format
    if (!PRICE_IDS[plan]?.startsWith('price_')) {
      console.error(`Invalid price ID for ${plan}:`, PRICE_IDS[plan]);
      return NextResponse.json(
        { error: `Invalid price configuration for ${plan} plan` },
        { status: 500 }
      );
    }

    // Get user profile to ensure they exist
    const { data: profile, error: profileError } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('user_id, username, display_name')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

        // Create or retrieve Stripe customer using wrapper
    let customerId: string;

    // Always create new Stripe customer (since we don't store customer_id in profiles)
    // We'll find existing customers by searching metadata
    let existingCustomer = null;
    try {
      const customers = await stripe.customers.search({
        query: `metadata['user_id']:'${userId}'`,
        limit: 1
      });
      if (customers.data.length > 0) {
        existingCustomer = customers.data[0];
      }
    } catch (error) {
      console.error('Error searching for existing customer:', error);
    }

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      // Create new Stripe customer using Stripe API (wrapper doesn't support INSERT for creation)
      const customer = await stripe.customers.create({
        email,
        metadata: {
          user_id: userId,
          username: profile.username,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session using Stripe API (wrapper doesn't support INSERT for creation)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/golden-carrot?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/golden-carrot?canceled=true`,
      metadata: {
        user_id: userId,
        plan,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan,
        },
      },
    });

        if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
