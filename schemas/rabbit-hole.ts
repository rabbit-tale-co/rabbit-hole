import { z } from "zod";
import { UUID } from "./_shared";

export const RabbitHoleRow = z.object({
  id: UUID,
  name: z.string().min(1).max(50), // unique name for URL
  display_name: z.string().min(1).max(100), // display name
  description: z.string().max(500).optional(),
  created_by: UUID,
  created_at: z.string(),
  updated_at: z.string(),
  is_public: z.boolean().default(true),
  member_count: z.number().default(0),
  post_count: z.number().default(0),
});

export const CreateRabbitHole = z.object({
  name: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, "Name can only contain lowercase letters, numbers, and hyphens"),
  display_name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  is_public: z.boolean().default(true),
});

export type RabbitHoleRow = z.infer<typeof RabbitHoleRow>;
export type CreateRabbitHole = z.infer<typeof CreateRabbitHole>;
