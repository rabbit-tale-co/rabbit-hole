import type { UUID, ImageMetaRow, CommentRow, PostRow } from "./db";
import type { Tile } from "./bento";

// DTOs for server actions / API

export type CreatePostDTO = {
  author_id: UUID;
  text?: string;
  images: ImageMetaRow[];
};

export type UpdatePostDTO = {
  post_id: UUID;
  author_id: UUID;
  text?: string;
  images?: ImageMetaRow[];
};

export type ToggleReactionDTO = {
  post_id: UUID;
  user_id: UUID;
};

export type AddCommentDTO = {
  post_id: UUID;
  author_id: UUID;
  text: string;
};

export type DeleteCommentDTO = {
  comment_id: UUID;
  author_id: UUID;
};

// API results

export type PostResult = { post: PostRow };
export type CommentResult = { comment: CommentRow };
export type OkResult = { ok: true; [k: string]: unknown };
export type ErrorResult = { error: string };

export type PostOrError = PostResult | ErrorResult;
export type CommentOrError = CommentResult | ErrorResult;
export type OkOrError = OkResult | ErrorResult;

export type Post = {
  id: string;
  images: { id: string; width: number; height: number; path: string; alt?: string }[];
  text?: string;
  like_count: number;
  repost_count: number;
  comment_count: number;
  bookmark_count: number;
};

// Cursor page

export type CursorInput = {
  cursor?: string | null; // base64(created_at|id)
  limit?: number;         // 1..50
};

export type FeedPage = {
  items: PostRow[];
  nextCursor: string | null;
};
