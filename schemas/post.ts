import { z } from "zod";
import { UUID, ISODate, Cursor } from "./_shared";
import { ImageMeta } from "./image";

export const PostRow = z.object({
  id: UUID,
  author_id: UUID,
  text: z.string().max(2000).nullable(),
  images: z.array(ImageMeta).min(1).max(10),
  is_deleted: z.boolean().default(false),
  created_at: ISODate,
  updated_at: ISODate,
  like_count: z.number().int().nonnegative(),
  repost_count: z.number().int().nonnegative(),
  comment_count: z.number().int().nonnegative(),
  bookmark_count: z.number().int().nonnegative(),
});

export const CreatePost = z.object({
  author_id: UUID,
  text: z.string().max(2000).optional(),
  images: z.array(ImageMeta).min(1).max(10),
});

export const UpdatePost = z.object({
  post_id: UUID,
  author_id: UUID,
  text: z.string().max(2000).optional(),
  images: z.array(ImageMeta).min(1).max(10).optional(),
});

export const PostIdUserId = z.object({
  post_id: UUID,
  user_id: UUID,
});

// comments
export const CommentRow = z.object({
  id: UUID,
  post_id: UUID,
  author_id: UUID,
  text: z.string().min(1).max(2000),
  is_deleted: z.boolean().default(false),
  created_at: ISODate,
});

export const CommentCreate = z.object({
  post_id: UUID,
  author_id: UUID,
  text: z.string().min(1).max(2000),
});

export const CommentDelete = z.object({
  comment_id: UUID,
  author_id: UUID,
});

// feed
export const FeedCursor = Cursor;
export const FeedPage = z.object({
  items: z.array(PostRow),
  nextCursor: z.string().nullable(),
});
