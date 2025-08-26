import { z } from "zod";
import { UUID } from "./_shared";

export const PresignPostImageUpload = z.object({
  postId: UUID,
  ext: z.enum(["jpg", "jpeg", "png", "webp"]),
  authorId: UUID,
});

export const PresignAvatarUpload = z.object({
  userId: UUID,
  ext: z.enum(["jpg", "jpeg", "png", "webp"]),
});

export const FinalizeAvatar = z.object({
  userId: UUID,
  path: z.string().min(1), // avatars/<uid>/avatar.jpg
});

export const SignedUploadResp = z.object({
  path: z.string(),
  url: z.url(),
  imageId: z.string(),
});
