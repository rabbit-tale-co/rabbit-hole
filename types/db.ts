// Shared primitives & DB row shapes (mirrors social_art schema)

export type UUID = string & { __brand: "uuid" };
export type ISODate = string & { __brand: "iso8601" };

export type ProfileRow = {
  user_id: UUID;
  username: string;
  display_name: string;
  bio: string | null;
  is_premium: boolean;
  is_admin: boolean;
  avatar_url: string | null;
  cover_url: string | null;
  accent_color: string | null; // "#RRGGBB"
  created_at: ISODate;
  updated_at: ISODate;
};

export type ImageMetaRow = {
  id: UUID;              // image UUID
  path: string;          // storage key: posts/<postId>/<imageId>.ext
  alt?: string;
  width: number;
  height: number;
  size_bytes: number;
  mime: "image/jpeg" | "image/png" | "image/webp" | "video/webm" | "video/mp4";
};

export type PostRow = {
  id: UUID;
  author_id: UUID;
  text: string | null;
  images: ImageMetaRow[];   // JSONB
  is_deleted: boolean;
  created_at: ISODate;
  updated_at: ISODate;
  like_count: number;
  repost_count: number;
  comment_count: number;
  bookmark_count: number;
  is_liked?: boolean;  // Added by API when fetching posts
};

export type CommentRow = {
  id: UUID;
  post_id: UUID;
  author_id: UUID;
  text: string;
  is_deleted: boolean;
  created_at: ISODate;
};

export type LikeRow = { post_id: UUID; user_id: UUID; created_at: ISODate };
export type RepostRow = { post_id: UUID; user_id: UUID; created_at: ISODate };
export type BookmarkRow = { post_id: UUID; user_id: UUID; created_at: ISODate };

export type AuditEventRow = {
  id: number;
  actor_id: UUID | null;
  kind: string;
  entity: "post" | "image" | "profile" | string;
  entity_id: UUID | null;
  meta: Record<string, unknown>;
  created_at: ISODate;
};
