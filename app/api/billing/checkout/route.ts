import { NextRequest, NextResponse } from 'next/server';
import { stripe, SITE_URL, DEFAULT_PRICE_ID } from '@/lib/stripe';
import { getUserIdOrThrow } from '@/lib/auth-server';
import { ensureCustomerOnProfile } from '@/lib/billing/subscriptions';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = await getUserIdOrThrow(request);

    // Parse request body
    const body = await request.json();
    const { priceId } = body;

    const finalPriceId = priceId || DEFAULT_PRICE_ID;

    if (!finalPriceId) {
      return NextResponse.json(
        { error: 'No price ID provided and no default price ID configured' },
        { status: 400 }
      );
    }

    // Create or get Stripe customer
    let customerId: string;

    try {
      // First, try to get existing customer from profile
      const { data: profile } = await supabaseAdmin
        .schema('social_art')
        .from('profiles')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id;
        console.log(`Using existing customer: ${customerId}`);
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          metadata: {
            user_id: userId,
          },
        });
        customerId = customer.id;

        // Link customer to profile
        await ensureCustomerOnProfile(userId, customerId);
        console.log(`Created new customer: ${customerId}`);
      }
    } catch (error) {
      console.error('Error creating/getting customer:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/settings/billing?success=true`,
      cancel_url: `${SITE_URL}/settings/billing?canceled=true`,
      metadata: {
        user_id: userId,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      payment_method_collection: 'always',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
