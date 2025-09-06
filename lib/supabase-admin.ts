import { createClient } from "@supabase/supabase-js";

// Admin client for social_art schema (profiles, posts, etc.)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role
  {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'social_art' },
  }
);

// Admin client for public schema (RPC functions for auth operations)
export const supabaseAuthAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role
  {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'public' },
  }
);

// Admin client for stripe schema (Stripe tables)
export const supabaseStripeAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role
  {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'stripe' },
  }
);
