import type { UUID } from "./db";

export type SignedUpload = {
  path: string;      // storage key (posts/... or avatars/...)
  url: string;       // presigned PUT url
  imageId: string;   // image UUID or "avatar"
};

export type PresignPostImageInput = {
  postId: UUID;
  ext: "jpg" | "jpeg" | "png" | "webp";
  authorId: UUID;
};

export type PresignAvatarInput = {
  userId: UUID;
  ext: "jpg" | "jpeg" | "png" | "webp";
};

export type FinalizeAvatarInput = {
  userId: UUID;
  path: string; // storage key that was uploaded
};

export type PublicUrl = string;
