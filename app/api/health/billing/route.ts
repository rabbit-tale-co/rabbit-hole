import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const checks = {
      stripe: false,
      database: false,
      webhook_secret: false,
      price_id: false,
    };

    // Check Stripe connection
    try {
      await stripe.products.list({ limit: 1 });
      checks.stripe = true;
    } catch (error) {
      console.error('Stripe health check failed:', error);
    }

    // Check database connection
    try {
      await supabaseAdmin
        .schema('social_art')
        .from('profiles')
        .select('count')
        .limit(1);
      checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Check webhook secret
    checks.webhook_secret = !!process.env.STRIPE_WEBHOOK_SECRET;

    // Check price ID
    checks.price_id = !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

    const allHealthy = Object.values(checks).every(Boolean);
    const status = allHealthy ? 200 : 503;

    return NextResponse.json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString(),
    }, { status });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
