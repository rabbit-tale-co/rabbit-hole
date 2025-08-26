import type { UUID } from "./db";

export type UpsertProfileDTO = {
  user_id: UUID;
  username: string;
  display_name: string;
  bio?: string | null;
  cover_url?: string | null;
  accent_color?: string | null; // "#RRGGBB"
};

// init after sign-up (if you still use API init)
export type InitProfileDTO = {
  user_id: UUID;
  meta: {
    username?: string;
    display_name?: string;
    is_premium?: boolean;
    avatar_url?: string | null;
    cover_url?: string | null;
    accent_color?: string | null;
  };
};
