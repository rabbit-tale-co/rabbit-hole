import { z } from "zod";
import { UUID, HEX6, USERNAME } from "./_shared";

export const ProfileRow = z.object({
  user_id: UUID,
  username: USERNAME,
  display_name: z.string().min(1).max(50),
  bio: z.string().max(500).nullable().optional(),
  is_premium: z.boolean().default(false),
  avatar_url: z.url().nullable().optional(),
  cover_url: z.url().nullable().optional(),
  accent_color: HEX6.nullable().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const UpsertProfile = z.object({
  user_id: UUID,
  username: USERNAME,
  display_name: z.string().min(1).max(50),
  bio: z.string().max(500).nullable().optional(),
  cover_url: z.url().nullable().optional(),
  accent_color: HEX6.nullable().optional(),
});

export const InitProfile = z.object({
  user_id: UUID,
  username: USERNAME.optional(),
});
