// client-side bento packing types
export type Tile = {
  id: string;            // post id
  w: 1 | 2;
  h: 1 | 2;
  cover: { path: string; width: number; height: number; alt?: string };
};

export type PlacedTile = {
  x: number;
  y: number;
  w: number;
  h: number;
  tile: Tile;
};
