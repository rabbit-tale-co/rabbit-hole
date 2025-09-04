import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.SECRET_STRIPE_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, type = 'donation' } = await request.json();

    if (!amount || amount < 200) { // Minimum $2.00 (200 cents)
      return NextResponse.json(
        { error: 'Amount must be at least $2.00' },
        { status: 400 }
      );
    }

    if (amount > 1000000) { // Maximum $10,000.00 (1,000,000 cents)
      return NextResponse.json(
        { error: 'Amount cannot exceed $10,000.00' },
        { status: 400 }
      );
    }

    // Create checkout session for one-time donation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'RabbitHole Support',
              description: `Thank you for supporting RabbitHole! Your $${(amount / 100).toFixed(2)} donation helps us keep the platform running.`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/support?success=true&amount=${amount}`,
      cancel_url: `${request.nextUrl.origin}/support?canceled=true`,
      metadata: {
        type: type,
        amount_usd: (amount / 100).toFixed(2),
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Create checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
