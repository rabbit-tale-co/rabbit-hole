import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ACCENT_COLORS, getAccentColorValue } from "@/lib/accent-colors";
import { InitProfile } from "@/schemas/profile";
import { USERNAME } from "@/schemas/_shared";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.SECRET_STRIPE_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Function to sync premium status with Stripe
async function syncPremiumStatus(userId: string) {
  try {
    // Get profile data first to check for manual subscriptions
    const { data: profile } = await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .select('stripe_customer_id, is_premium')
      .eq('user_id', userId)
      .single();

    // console.log(`🔍 [SYNC PREMIUM] Profile data for user ${userId}:`, {
    //   stripe_customer_id: profile?.stripe_customer_id,
    //   is_premium: profile?.is_premium
    // });

    // Check for manual subscription first
    if (profile?.stripe_customer_id && profile.stripe_customer_id.startsWith('manual_')) {
      // console.log(`✅ [SYNC PREMIUM] Manual subscription detected, returning current is_premium: ${profile.is_premium} for user: ${userId}`);
      // For manual subscriptions, return the current is_premium status
      return profile.is_premium;
    }

    // Search for Stripe customer by metadata
    const customers = await stripe.customers.search({
      query: `metadata['user_id']:'${userId}'`,
      limit: 1
    });

    if (customers.data.length === 0) {
      // console.log(`🔍 [SYNC PREMIUM] No Stripe customer found for user: ${userId}`);

      // console.log(`❌ [SYNC PREMIUM] No manual subscription detected, setting is_premium to false for user: ${userId}`);
      // No customer found, ensure is_premium is false
      await supabaseAdmin
        .schema('social_art')
        .from('profiles')
        .update({ is_premium: false })
        .eq('user_id', userId);
      return false;
    }

    const customer = customers.data[0];

    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    });

    // Find active subscription
    const activeSubscription = subscriptions.data.find(sub =>
      sub.status === 'active' || sub.status === 'trialing'
    );

    const shouldBePremium = activeSubscription ?
      (activeSubscription.status === 'active' || activeSubscription.status === 'trialing') :
      false;

    // Update profile
    await supabaseAdmin
      .schema('social_art')
      .from('profiles')
      .update({ is_premium: shouldBePremium })
      .eq('user_id', userId);

    return shouldBePremium;
  } catch (error) {
    console.error('Error syncing premium status:', error);
    // On error, don't change the current status
    return null;
  }
}

async function findUniqueUsername(base: string) {
  const candidate = base;
  while (true) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .ilike("username", candidate)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`username check failed: ${error.message}`);
    if (!data) return candidate;
  }
}

async function isUsernameAvailable(candidate: string, excludeUserId?: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("user_id, username")
    .ilike("username", candidate)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`username check failed: ${error.message}`);
  if (!data) return true;
  if (excludeUserId && data.user_id === excludeUserId) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = InitProfile.safeParse(json);
    if (!parsed.success) return Response.json({ error: "invalid payload" }, { status: 400 });

    const { user_id, username: desiredUsername } = parsed.data;

    // helper to pick random accent hex
    const pickRandomAccentHex = () => {
      const idx = Math.floor(Math.random() * ACCENT_COLORS.length);
      const name = ACCENT_COLORS[idx];
      return getAccentColorValue(name, 500);
    };

    // 1) If exists: ensure accent_color is set and optionally apply desired username
    {
      const { data: existing, error: exErr } = await supabaseAdmin
        .from("profiles")
        .select("user_id, accent_color, username, display_name")
        .eq("user_id", user_id)
        .maybeSingle();
      if (exErr) {
        console.error("init.check_existing.error", exErr);
        return Response.json({ stage: "check_existing", error: exErr.message, code: (exErr as { code?: string }).code, details: (exErr as { details?: string }).details, hint: (exErr as { hint?: string }).hint }, { status: 500 });
      }
      if (existing) {
        const updates: Record<string, unknown> = {};
        // assign random accent if missing
        if (!existing.accent_color) {
          updates.accent_color = pickRandomAccentHex();
        }
        // if caller provided a desired username, try to apply it
        const candidateOk = desiredUsername ? USERNAME.safeParse(desiredUsername).success : false;
        if (candidateOk) {
          const base = String(desiredUsername).toLowerCase();
          if (base !== existing.username?.toLowerCase()) {
            const available = await isUsernameAvailable(base, user_id);
            if (!available) {
              return Response.json({ error: "username_taken" }, { status: 409 });
            }
            updates.username = base;
            // update display_name only if it previously mirrored username
            if (!existing.display_name || existing.display_name.toLowerCase() === (existing.username ?? '').toLowerCase()) {
              updates.display_name = base;
            }
          }
        }

        // Sync premium status with Stripe (this happens on every login)
        // console.log(`🔍 [PROFILE INIT] Syncing premium status for user: ${user_id}`);
        const syncedPremiumStatus = await syncPremiumStatus(user_id);
        // console.log(`🔍 [PROFILE INIT] Synced premium status: ${syncedPremiumStatus} for user: ${user_id}`);
        if (syncedPremiumStatus !== null) {
          updates.is_premium = syncedPremiumStatus;
          // console.log(`🔍 [PROFILE INIT] Will update is_premium to: ${syncedPremiumStatus} for user: ${user_id}`);
        }

        if (Object.keys(updates).length > 0) {
          const { error: upErr } = await supabaseAdmin
            .from("profiles")
            .update(updates)
            .eq("user_id", user_id);
          if (upErr) {
            console.error("init.update_existing.error", upErr);
            return Response.json({ stage: "update_existing", error: upErr.message, code: (upErr as { code?: string }).code, details: (upErr as { details?: string }).details, hint: (upErr as { hint?: string }).hint }, { status: 500 });
          }
          return Response.json({ ok: true, updated: true, stage: "update_existing", applied: Object.keys(updates) });
        }
        return Response.json({ ok: true, skipped: true, stage: "exists_noop" });
      }
    }

    // 2) Defaults and derivations
    const candidateOk = desiredUsername ? USERNAME.safeParse(desiredUsername).success : false;
    let username: string;
    if (candidateOk && desiredUsername) {
      const base = String(desiredUsername).toLowerCase();
      const available = await isUsernameAvailable(base);
      if (!available) {
        return Response.json({ error: "username_taken" }, { status: 409 });
      }
      username = base;
    } else {
      const base = `user_${user_id.slice(0, 6)}`;
      username = await findUniqueUsername(base);
    }

    const display_name = username;

    const accent = pickRandomAccentHex();

    const payload = {
        user_id,
        username,
        display_name,
      is_premium: false,
      avatar_url: null,
      cover_url: null,
      accent_color: accent,
    };

    // 3) Insert
    const { error } = await supabaseAdmin
      .from("profiles")
      .insert(payload);
    if (error) {
      console.error("init.insert_profile.error", error, { payload });
      return Response.json({ stage: "insert_profile", error: error.message, code: (error as { code?: string }).code, details: (error as { details?: string }).details, hint: (error as { hint?: string }).hint, inputSummary: { user_id, username } }, { status: 500 });
    }

    return Response.json({ ok: true, stage: "insert_profile", inputSummary: { user_id, username } });
  } catch (e) {
    console.error("init.catch", e);
    const msg = e instanceof Error ? e.message : "init failed";
    return Response.json({ stage: "catch", error: msg }, { status: 500 });
  }
}
