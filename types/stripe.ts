import type { UUID } from "./db";

export type StripeWebhookResult = { ok: true } | { error: string };

// How you store the mapping (choose either location in your app)
export type StripeCustomerLink = {
  user_id: UUID;
  customer_id: string;          // cus_...
  subscription_id?: string;     // sub_...
  status?: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | "unpaid" | null;
};
