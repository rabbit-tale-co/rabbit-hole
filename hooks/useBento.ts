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

export function packAppend(existing: PlacedTile[], incoming: Tile[], cols: number, strategy: PackStrategy = 'recency'): PlacedTile[] {
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

  const tiles = strategy === 'fit' ? [...incoming].sort((a,b)=>(b.w*b.h)-(a.w*a.h)) : incoming;
  for (const t of tiles) {
    const placeW = Math.max(1, Math.min(t.w, cols));
    const placeH = cols === 1 ? 1 : t.h; // keep feed compact on phones
    const { x, y } = fitAt(placeW, placeH);
    occupy(x, y, placeW, placeH);
    out.push({ x, y, w: placeW, h: placeH, tile: t });
  }
  return out;
}

// Generic variant used by skeletons or any items that only have w/h
export type PlacedGeneric<T extends { w: 1|2; h: 1|2 }> = {
  x: number; y: number; w: number; h: number; tile: T;
};

export function packAppendGeneric<T extends { w: 1|2; h: 1|2 }>(
  existing: PlacedGeneric<T>[],
  incoming: T[],
  cols: number,
  strategy: PackStrategy = 'recency'
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

  const tiles = strategy === 'fit' ? [...incoming].sort((a,b)=>(b.w*b.h)-(a.w*a.h)) : incoming;
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
    // Prefer tighter packing: prioritize big 2x2 first
    return packAppend([], tiles, cols, 'recency');
  }, [tiles, cols]);

  return { cols, placed };
}
