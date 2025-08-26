import { PlacedTile, Tile } from "@/types";

export function bucketFromWH(w: number, h: number): {
  w: 1 | 2;
  h: 1 | 2
} {
  const a = w / h;
  if (w >= 1200 && h >= 1200 && Math.abs(a - 1) < 0.15) return { w: 2, h: 2 }; // premium/rare
  if (a >= 1.3) return { w: 2, h: 1 };
  if (a <= 1/1.3) return { w: 1, h: 2 };
  return { w: 1, h: 1 };
}

export function packAppend(
  existing: PlacedTile[],    // previously placed tiles
  incoming: Tile[],      // new tiles to place
  cols: number
): PlacedTile[] {
  const grid: number[][] = [];
  // materialize occupancy from existing
  for (const p of existing) {
    for (let yy = 0; yy < p.h; yy++) {
      if (!grid[p.y + yy]) grid[p.y + yy] = Array(cols).fill(0);
      for (let xx = 0; xx < p.w; xx++) grid[p.y + yy][p.x + xx] = 1;
    }
  }
  const out = [...existing];

  // place bigger first to reduce fragmentation
  const tiles = [...incoming].sort((a,b)=> (b.w*b.h)-(a.w*a.h));

  const fitAt = (w:number,h:number) => {
    let y=0;
    while (true) {
      for (let x=0; x<=cols-w; x++) {
        let ok = true;
        for (let dy=0; dy<h && ok; dy++) {
          if (!grid[y+dy]) grid[y+dy] = Array(cols).fill(0);
          for (let dx=0; dx<w; dx++) if (grid[y+dy][x+dx]) { ok=false; break; }
        }
        if (ok) return {x,y};
      }
      y++;
    }
  };

  for (const t of tiles) {
    const {x,y} = fitAt(t.w,t.h);
    for (let dy=0; dy<t.h; dy++) {
      if (!grid[y+dy]) grid[y+dy] = Array(cols).fill(0);
      for (let dx=0; dx<t.w; dx++) grid[y+dy][x+dx] = 1;
    }
    out.push({ x, y, w: t.w, h: t.h, tile: t });
  }

  // secondary compaction: slide newly placed tiles left to remove horizontal gaps
  const startIdx = existing.length;
  const setOccupancy = (x:number,y:number,w:number,h:number,val:number) => {
    for (let dy=0; dy<h; dy++) {
      if (!grid[y+dy]) grid[y+dy] = Array(cols).fill(0);
      for (let dx=0; dx<w; dx++) grid[y+dy][x+dx] = val;
    }
  };

  const movable = out.slice(startIdx).sort((a,b)=> a.y - b.y || a.x - b.x);
  for (const p of movable) {
    // free current cells
    setOccupancy(p.x, p.y, p.w, p.h, 0);
    let targetX = p.x;
    while (targetX > 0) {
      let canSlide = true;
      for (let dy = 0; dy < p.h && canSlide; dy++) {
        if (!grid[p.y+dy]) grid[p.y+dy] = Array(cols).fill(0);
        for (let dx = 0; dx < p.w; dx++) {
          if (grid[p.y+dy][(targetX - 1) + dx]) { canSlide = false; break; }
        }
      }
      if (!canSlide) break;
      targetX--;
    }
    // occupy final cells and update position
    setOccupancy(targetX, p.y, p.w, p.h, 1);
    p.x = targetX;
  }
  return out;
}

type PixelNode = {
  key: string;
  tile: Tile;
  style: React.CSSProperties; // {position:'absolute', left, top, width, height}
};

/**
 * Zamień wynik packAppend na absolutnie pozycjonowane węzły z gapami.
 * cell = rozmiar „jednej kratki” w px (np. 240 lub 288)
 * gap  = odstęp między kaflami w px (np. 12)
 */
export function toPixels(placed: PlacedTile[], cell: number, gap: number) {
  const leftPx   = (x: number) => x * cell + x * gap;
  const topPx    = (y: number) => y * cell + y * gap;
  const widthPx  = (w: number) => w * cell + (w - 1) * gap;
  const heightPx = (h: number) => h * cell + (h - 1) * gap;

  const nodes: PixelNode[] = placed.map(p => ({
    key: p.tile.id,
    tile: p.tile,
    style: {
      position: 'absolute',
      left: leftPx(p.x),
      top: topPx(p.y),
      width: widthPx(p.w),
      height: heightPx(p.h),
    },
  }));

  const rows = placed.length ? Math.max(...placed.map(p => p.y + p.h)) : 0;
  const containerHeight = rows > 0 ? rows * cell + (rows - 1) * gap : 0;

  return { nodes, containerHeight };
}
