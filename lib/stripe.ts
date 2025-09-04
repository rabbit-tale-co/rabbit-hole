import Stripe from 'stripe';

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fallback', {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

// Stripe webhook secret for signature verification
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_fallback';

// Default price ID for subscriptions
export const DEFAULT_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_fallback';

// Site URL for redirects
export const SITE_URL = process.env.PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Grace period for past_due subscriptions (in hours)
export const PREMIUM_GRACE_HOURS = parseInt(process.env.PREMIUM_GRACE_HOURS || '24', 10);
