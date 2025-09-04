import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

interface SubscriptionWithItems extends Omit<Stripe.Subscription, 'items'> {
  items: {
    data: Array<{
      current_period_end: number;
    }>;
  };
}

const stripe = new Stripe(process.env.SECRET_STRIPE_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, userId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Cancel the subscription at the end of the current period
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    console.log(`Subscription ${subscriptionId} set to cancel at period end for user ${userId}`);
    console.log('Subscription data:', JSON.stringify(subscription, null, 2));

    const sub = subscription as SubscriptionWithItems;
    return NextResponse.json({
      success: true,
      subscription: {
        id: sub.id,
        status: sub.status,
        cancel_at_period_end: sub.cancel_at_period_end,
        current_period_end: sub.items.data[0]?.current_period_end ? new Date(sub.items.data[0].current_period_end * 1000).toISOString() : null,
        canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null
      },
      message: 'Subscription will be canceled at the end of the current billing period'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
