import { z } from "zod";
import { UUID, Cursor } from "./_shared";
import { POST_CONTENT_WITH_BANNABLE_CHECK, COMMENT_WITH_BANNABLE_CHECK } from "@/lib/bannable-words-schema";

export const PostRow = z.object({
  id: UUID,
  author_id: UUID,
  content: POST_CONTENT_WITH_BANNABLE_CHECK,
  media_url: z.url().nullable().optional(),
  media_type: z.enum(["image", "video", "audio"]).nullable().optional(),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const CreatePost = z.object({
  content: POST_CONTENT_WITH_BANNABLE_CHECK,
  media_url: z.url().optional(),
  media_type: z.enum(["image", "video", "audio"]).optional(),
});

export const CommentRow = z.object({
  id: UUID,
  post_id: UUID,
  author_id: UUID,
  content: COMMENT_WITH_BANNABLE_CHECK,
  parent_id: UUID.nullable().optional(),
  is_deleted: z.boolean().default(false),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const CreateComment = z.object({
  post_id: UUID,
  content: COMMENT_WITH_BANNABLE_CHECK,
  parent_id: UUID.optional(),
});

export const PostsQuery = Cursor.extend({
  author_id: UUID.optional(),
  limit: z.number().int().min(1).max(50).default(24),
});

export const CommentsQuery = Cursor.extend({
  post_id: UUID,
  parent_id: UUID.nullable().optional(),
  limit: z.number().int().min(1).max(50).default(24),
});
