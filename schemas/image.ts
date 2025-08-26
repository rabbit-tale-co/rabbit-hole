import { z } from "zod";
import { MimeImage, PositiveInt } from "./_shared";

export const ImageMeta = z.object({
  id: z.uuid(),
  path: z.string().min(1), // storage key: posts/<postId>/<imageId>.<ext>
  alt: z.string().max(300).optional().default(""),
  width: PositiveInt.max(10_000),
  height: PositiveInt.max(10_000),
  size_bytes: PositiveInt.max(50_000_000),
  mime: MimeImage,
});
export type ImageMetaInput = z.infer<typeof ImageMeta>;
