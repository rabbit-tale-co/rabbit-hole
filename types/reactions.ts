export type ReactionKind = "like" | "bookmark" | "repost";

export type ReactionState = {
  liked: boolean;
  bookmarked: boolean;
  reposted: boolean;
  pending: null | ReactionKind;
};
