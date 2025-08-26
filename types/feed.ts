import type { PostRow } from "./db";

export type FeedInitial = {
  items: PostRow[];
  nextCursor: string | null;
} | undefined;

export type UseInfiniteFeedState = {
  items: PostRow[];
  loadMore: () => void | Promise<void>;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
};
