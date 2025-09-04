import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.SECRET_STRIPE_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Customer portal request received');

    // Get user ID from request body
    const body = await request.json();
    const userId = body.userId;

    if (!userId) {
      console.log('❌ No userId provided');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('👤 User ID from request:', userId);
    console.log('🔍 Looking for customer with user_id:', userId);

    // Search for Stripe customer by metadata
    const customers = await stripe.customers.search({
      query: `metadata['user_id']:'${userId}'`,
      limit: 1
    });

    console.log('📋 Found customers:', customers.data.length);

    if (customers.data.length === 0) {
      console.log('❌ No customer found for user_id:', userId);

      // Try to find customer by email as fallback
      const userEmail = null; // getUser() only returns id
      if (userEmail) {
        console.log('🔍 Trying to find customer by email:', userEmail);
        const emailCustomers = await stripe.customers.search({
          query: `email:'${userEmail}'`,
          limit: 1
        });

        if (emailCustomers.data.length > 0) {
          console.log('✅ Found customer by email:', emailCustomers.data[0].id);
          const customer = emailCustomers.data[0];

          // Create customer portal session
          const session = await stripe.billingPortal.sessions.create({
            customer: customer.id,
            return_url: `${request.nextUrl.origin}/golden-carrot`,
          });

          console.log('✅ Customer portal session created:', session.url);
          return NextResponse.json({ url: session.url });
        }
      }

      return NextResponse.json(
        { error: 'No Stripe customer found. Please make a purchase first.' },
        { status: 404 }
      );
    }

    const customer = customers.data[0];
    console.log('✅ Found customer:', customer.id);

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${request.nextUrl.origin}/golden-carrot`,
    });

    console.log('✅ Customer portal session created:', session.url);

    return NextResponse.json({
      url: session.url,
    });

  } catch (error) {
    console.error('❌ Customer portal error:', error);

    // Check if it's a specific Stripe error
    if (error instanceof Error) {
      if (error.message.includes('billing portal')) {
        return NextResponse.json(
          { error: 'Customer Portal not configured in Stripe Dashboard. Please enable it first.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    );
  }
}
