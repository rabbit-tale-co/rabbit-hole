import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role
  {
    // use public schema (PostgREST exposes public by default); we hit public views
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'social_art' },
  }
);
