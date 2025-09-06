"use client";

import { PlacedTile, Tile } from "@/types";
import { useEffect, useMemo, useState } from "react";

export function bucketFromWH(w: number, h: number): { w: 1|2; h: 1|2 } {
  const a = w / h;
  if (w >= 1200 && h >= 1200 && Math.abs(a - 1) < 0.15) return { w: 2, h: 2 };
  if (a >= 1.3) return { w: 2, h: 1 };
  if (a <= 1 / 1.3) return { w: 1, h: 2 };
  return { w: 1, h: 1 };
}

export type PackStrategy = 'recency' | 'fit';

export function packAppend(existing: PlacedTile[], incoming: Tile[], cols: number): PlacedTile[] {
  const grid: number[][] = [];
  const out = [...existing];

  const occupy = (x:number,y:number,w:number,h:number) => {
    for (let yy=0; yy<h; yy++) {
      if (!grid[y+yy]) grid[y+yy] = Array(cols).fill(0);
      for (let xx=0; xx<w; xx++) grid[y+yy][x+xx] = 1;
    }
  };
  for (const p of existing) occupy(p.x, p.y, p.w, p.h);

  const fitAt = (w:number,h:number) => {
    let y=0;
    while (true) {
      for (let x=0; x<=cols-w; x++) {
        let ok = true;
        for (let dy=0; dy<h && ok; dy++) {
          if (!grid[y+dy]) grid[y+dy] = Array(cols).fill(0);
          for (let dx=0; dx<w; dx++) if (grid[y+dy][x+dx]) { ok=false; break; }
        }
        if (ok) return { x, y };
      }
      y++;
    }
  };

  // Helper function to get size variants for gap filling
  const getSizeVariants = (originalW: number, originalH: number): {w: number, h: number}[] => {
    const variants = [];

    // Original size
    variants.push({ w: originalW, h: originalH });

    // Try smaller sizes to fill gaps
    if (originalW === 2 && originalH === 2) {
      variants.push({ w: 2, h: 1 }, { w: 1, h: 2 }, { w: 1, h: 1 });
    } else if (originalW === 2 && originalH === 1) {
      variants.push({ w: 1, h: 1 });
    } else if (originalW === 1 && originalH === 2) {
      variants.push({ w: 1, h: 1 });
    }

    return variants;
  };

  // Helper function to find best fit with gap filling
  const findBestFit = (tile: Tile, tileIndex: number) => {
    const variants = getSizeVariants(tile.w, tile.h);
    let bestFit = null;
    let bestScore = Infinity; // lower is better (earlier row, then smaller x)

    for (const variant of variants) {
      const placeW = Math.max(1, Math.min(variant.w, cols));
      const placeH = cols === 1 ? 1 : variant.h;

      try {
        const { x, y } = fitAt(placeW, placeH);
        // Prioritize chronological order: earlier items should be placed first
        // Use tileIndex to ensure chronological order is maintained
        const score = (y * 1000 + x) + (tileIndex * 0.001); // tiny penalty for later items

        if (score < bestScore) {
          bestScore = score;
          bestFit = { x, y, w: placeW, h: placeH };
        }
      } catch {
        // If this variant doesn't fit, try the next one
        continue;
      }
    }

    return bestFit;
  };

  const tiles = [...incoming]; // Always preserve chronological order
  for (let i = 0; i < tiles.length; i++) {
    const t = tiles[i];
    const bestFit = findBestFit(t, i);
    if (bestFit) {
      occupy(bestFit.x, bestFit.y, bestFit.w, bestFit.h);
      out.push({ x: bestFit.x, y: bestFit.y, w: bestFit.w as 1|2, h: bestFit.h as 1|2, tile: { ...t, w: bestFit.w as 1|2, h: bestFit.h as 1|2 } });
    } else {
      // Fallback to original logic if no variant fits
      const placeW = Math.max(1, Math.min(t.w, cols));
      const placeH = cols === 1 ? 1 : t.h;
      const { x, y } = fitAt(placeW, placeH);
      occupy(x, y, placeW, placeH);
      out.push({ x, y, w: placeW, h: placeH, tile: t });
    }
  }

  // Secondary compaction: try to move items left to fill gaps
  const compactGrid = () => {
    const movable = out.slice(existing.length).sort((a, b) => a.y - b.y || a.x - b.x);

    for (const p of movable) {
      // Clear current position
      for (let dy = 0; dy < p.h; dy++) {
        if (!grid[p.y + dy]) grid[p.y + dy] = Array(cols).fill(0);
        for (let dx = 0; dx < p.w; dx++) grid[p.y + dy][p.x + dx] = 0;
      }

      // Try to move left
      let targetX = p.x;
      while (targetX > 0) {
        let canMove = true;
        for (let dy = 0; dy < p.h && canMove; dy++) {
          if (!grid[p.y + dy]) grid[p.y + dy] = Array(cols).fill(0);
          for (let dx = 0; dx < p.w; dx++) {
            if (grid[p.y + dy][targetX - 1 + dx]) {
              canMove = false;
              break;
            }
          }
        }
        if (!canMove) break;
        targetX--;
      }

      // Occupy new position
      for (let dy = 0; dy < p.h; dy++) {
        if (!grid[p.y + dy]) grid[p.y + dy] = Array(cols).fill(0);
        for (let dx = 0; dx < p.w; dx++) grid[p.y + dy][targetX + dx] = 1;
      }

      p.x = targetX;
    }
  };

  compactGrid();
  return out;
}

// Generic variant used by skeletons or any items that only have w/h
export type PlacedGeneric<T extends { w: 1|2; h: 1|2 }> = {
  x: number; y: number; w: number; h: number; tile: T;
};

export function packAppendGeneric<T extends { w: 1|2; h: 1|2 }>(
  existing: PlacedGeneric<T>[],
  incoming: T[],
  cols: number
): PlacedGeneric<T>[] {
  const grid: number[][] = [];
  const out = [...existing];

  const occupy = (x:number,y:number,w:number,h:number) => {
    for (let yy=0; yy<h; yy++) {
      if (!grid[y+yy]) grid[y+yy] = Array(cols).fill(0);
      for (let xx=0; xx<w; xx++) grid[y+yy][x+xx] = 1;
    }
  };
  for (const p of existing) occupy(p.x, p.y, p.w, p.h);

  const fitAt = (w:number,h:number) => {
    let y=0;
    while (true) {
      for (let x=0; x<=cols-w; x++) {
        let ok = true;
        for (let dy=0; dy<h && ok; dy++) {
          if (!grid[y+dy]) grid[y+dy] = Array(cols).fill(0);
          for (let dx=0; dx<w; dx++) if (grid[y+dy][x+dx]) { ok=false; break; }
        }
        if (ok) return { x, y };
      }
      y++;
    }
  };

  const tiles = [...incoming]; // Always preserve chronological order
  for (const t of tiles) {
    const placeW = Math.max(1, Math.min(t.w, cols));
    const placeH = cols === 1 ? 1 : t.h;
    const { x, y } = fitAt(placeW, placeH);
    occupy(x, y, placeW, placeH);
    out.push({ x, y, w: placeW, h: placeH, tile: t });
  }
  return out;
}

export function useBento(tiles: Tile[]) {
  const [cols, setCols] = useState(3);

  // responsive columns with rAF-throttled resize; update only when bucket changes
  useEffect(() => {
    const computeCols = (w: number) => (w < 640 ? 1 : w < 1024 ? 2 : 3);
    let frame = 0;
    const onResize = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = computeCols(window.innerWidth);
        setCols((prev) => (prev === next ? prev : next));
      });
    };
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", onResize); };
  }, []);

  // compute placed purely with memo to avoid setState churn on rapid resizes
  const placed = useMemo<PlacedTile[]>(() => {
    // Use 'recency' strategy to preserve chronological order with gap filling
    return packAppend([], tiles, cols);
  }, [tiles, cols]);

  return { cols, placed };
}
