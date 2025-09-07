import { z } from "zod";
import { UUID, HEX6, USERNAME } from "./_shared";
import {
  USERNAME_WITH_BANNABLE_CHECK,
  BIO_WITH_BANNABLE_CHECK,
  DISPLAY_NAME_WITH_BANNABLE_CHECK
} from "@/lib/bannable-words-schema";

export const ProfileRow = z.object({
  user_id: UUID,
  username: USERNAME_WITH_BANNABLE_CHECK,
  display_name: DISPLAY_NAME_WITH_BANNABLE_CHECK,
  bio: BIO_WITH_BANNABLE_CHECK,
  is_premium: z.boolean().default(false),
  avatar_url: z.url().nullable().optional(),
  cover_url: z.url().nullable().optional(),
  accent_color: HEX6.nullable().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const UpsertProfile = z.object({
  user_id: UUID,
  username: USERNAME_WITH_BANNABLE_CHECK,
  display_name: DISPLAY_NAME_WITH_BANNABLE_CHECK,
  bio: BIO_WITH_BANNABLE_CHECK,
  cover_url: z.url().nullable().optional(),
  accent_color: HEX6.nullable().optional(),
});

// Client-side schema without user_id (more secure)
export const UpsertProfileClient = z.object({
  username: USERNAME_WITH_BANNABLE_CHECK,
  display_name: DISPLAY_NAME_WITH_BANNABLE_CHECK,
  bio: BIO_WITH_BANNABLE_CHECK,
  cover_url: z.url().nullable().optional(),
  accent_color: HEX6.nullable().optional(),
});

export const InitProfile = z.object({
  username: USERNAME.optional(),
});
