import type { UUID } from "./db";
import type { Tile, PlacedTile } from "./bento";
import type { PostRow } from "./db";

export type UseReactionsArgs = { postId: UUID; userId: UUID; init?: Partial<{ liked: boolean; bookmarked: boolean; reposted: boolean }> };
export type UseReactionsReturn = {
  liked: boolean; bookmarked: boolean; reposted: boolean;
  pending: null | "like" | "bookmark" | "repost";
  toggle: (kind: "like" | "bookmark" | "repost") => Promise<void> | void;
};

export type UsePostComposerReturn = {
  busy: boolean;
  error: string | null;
  create: (caption: string | undefined, files: File[]) => Promise<PostRow | null>;
  edit: (post_id: UUID, caption?: string, images?: PostRow["images"]) => Promise<PostRow | null>;
  remove: (post_id: UUID) => Promise<boolean>;
};

export type UseBentoReturn = {
  cols: number;
  placed: PlacedTile[];
};

export type UseIntersectionReturn = React.RefObject<HTMLDivElement>;
