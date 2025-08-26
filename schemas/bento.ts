import { z } from "zod";

export const Tile = z.object({
  id: z.string(), // post id
  w: z.union([z.literal(1), z.literal(2)]),
  h: z.union([z.literal(1), z.literal(2)]),
  cover: z.object({
    path: z.string(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string().optional(),
  }),
});

export const PlacedTile = z.object({
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  w: z.union([z.literal(1), z.literal(2)]),
  h: z.union([z.literal(1), z.literal(2)]),
  tile: Tile,
});
