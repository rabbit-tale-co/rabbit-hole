import { z } from "zod";
import { UUID } from "./_shared";

export const StripeCustomerLink = z.object({
  user_id: UUID,
  customer_id: z.string(),
  subscription_id: z.string().optional(),
  status: z.enum([
    "active","trialing","past_due","canceled","incomplete","incomplete_expired","unpaid"
  ]).nullable().optional(),
});

export const StripeWebhookResult = z.union([
  z.object({ ok: z.literal(true) }),
  z.object({ error: z.string() }),
]);
