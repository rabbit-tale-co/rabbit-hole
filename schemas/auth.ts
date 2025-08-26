import { z } from "zod";
import { HEX6, USERNAME } from "./_shared";

// Client forms
export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const RegisterSchema = LoginSchema.extend({
  username: USERNAME,
  display_name: z.string().min(1).max(50),
  avatar_url: z.url().optional(),
  cover_url: z.url().optional(),
  accent_color: HEX6.optional(),
});

// Context-safe export types (optional)
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
