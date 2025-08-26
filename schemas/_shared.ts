import { z } from "zod";

// Primitives
export const UUID = z.uuid();
export const ISODate = z.date();

// Common regexes
export const USERNAME = z.string().min(3).max(20).regex(/^[a-z0-9_]+$/);
export const HEX6 = z.string().regex(/^#?[0-9a-fA-F]{6}$/);

// Helpers
export const PositiveInt = z.number().int().positive();
export const MimeImage = z.enum(["image/jpeg", "image/png", "image/webp"]);

// Pagination
export const Cursor = z.object({
  cursor: z.string().optional(), // base64(created_at|id)
  limit: z.number().int().min(1).max(50).default(24),
});
