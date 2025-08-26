import { z } from "zod";
import { UUID } from "./_shared";

export const ReactionToggle = z.object({
  post_id: UUID,
  user_id: UUID,
  on: z.boolean().default(true),
});

export const ReactionKind = z.enum(["likes", "bookmarks", "reposts"]);
