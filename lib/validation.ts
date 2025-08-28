import { z } from "zod";

export const ImageMeta = z.object({
  id: z.uuid(),
  path: z.string().min(1),
  alt: z.string().max(300).default(""),
  width: z.number().int().positive().max(10_000),
  height: z.number().int().positive().max(10_000),
  size_bytes: z.number().int().positive().max(50_000_000),
  mime: z.enum(["image/jpeg","image/png","image/webp","image/gif","video/webm","video/mp4"]),
});

export const CreatePost = z.object({
  text: z.string().max(2000).optional(),
  images: z.array(ImageMeta).min(1).max(10),
});

export const UpdatePost = z.object({
  text: z.string().max(2000).optional(),
  images: z.array(ImageMeta).min(1).max(10).optional(),
});

export const Cursor = z.object({
  cursor: z.string().optional(), // base64 encoded created_at|id
  limit: z.number().int().min(1).max(50).default(24),
});
