import { PlacedTile, Tile } from "@/types";

export function bucketFromWH(w: number, h: number): { w: 1 | 2; h: 1 | 2 } {
  const a = w / h;
  if (w >= 1200 && h >= 1200 && Math.abs(a - 1) < 0.15) return { w: 2, h: 2 };
  if (a >= 1.3) return { w: 2, h: 1 };
  if (a <= 1 / 1.3) return { w: 1, h: 2 };
  return { w: 1, h: 1 };
}

type Size = { w: 1 | 2; h: 1 | 2 };
const area = (s: Size) => s.w * s.h as 1 | 2 | 4;

function variantsFor(w: 1 | 2, h: 1 | 2): Size[] {
  if (w === 2 && h === 2) return [{ w: 2, h: 2 }, { w: 2, h: 1 }, { w: 1, h: 2 }, { w: 1, h: 1 }];
  if (w === 2 && h === 1) return [{ w: 2, h: 1 }, { w: 1, h: 1 }];
  if (w === 1 && h === 2) return [{ w: 1, h: 2 }, { w: 1, h: 1 }];
  return [{ w: 1, h: 1 }];
}

export function packAppend(
  existing: PlacedTile[],
  incoming: Tile[],
  cols: number,
  options?: { shrinkToFill?: boolean }
): PlacedTile[] {
  const shrinkToFill = options?.shrinkToFill ?? true;

  // occupancy grid
  const grid: number[][] = [];
  for (const p of existing) {
    for (let yy = 0; yy < p.h; yy++) {
      if (!grid[p.y + yy]) grid[p.y + yy] = Array(cols).fill(0);
      for (let xx = 0; xx < p.w; xx++) grid[p.y + yy][p.x + xx] = 1;
    }
  }
  const out = [...existing];

  // helper: find earliest spot for (w,h)
  const fitAt = (w: 1 | 2, h: 1 | 2) => {
    let y = 0;
    // scan downward until a free rectangle appears
    while (true) {
      for (let x = 0; x <= cols - w; x++) {
        let ok = true;
        for (let dy = 0; dy < h && ok; dy++) {
          if (!grid[y + dy]) grid[y + dy] = Array(cols).fill(0);
          for (let dx = 0; dx < w; dx++) {
            if (grid[y + dy][x + dx]) {
              ok = false;
              break;
            }
          }
        }
        if (ok) return { x, y };
      }
      y++;
    }
  };

  // place bigger first to reduce fragmentation
  const tiles = [...incoming].sort((a, b) => (b.w * b.h) - (a.w * a.h));

  for (const t of tiles) {
    let chosen: { x: number; y: number; w: 1 | 2; h: 1 | 2 };

    if (shrinkToFill) {
      // try all allowed size variants; pick one with the smallest y (earliest row)
      // tie-break: prefer larger area, then smaller x.
      let best: { x: number; y: number; w: 1 | 2; h: 1 | 2 } | null = null;
      for (const s of variantsFor(t.w as 1 | 2, t.h as 1 | 2)) {
        const { x, y } = fitAt(s.w, s.h);
        if (
          !best ||
          y < best.y ||
          (y === best.y && (area(s) > area(best) || (area(s) === area(best) && x < best.x)))
        ) {
          best = { x, y, ...s };
        }
      }
      chosen = best!;
    } else {
      const { x, y } = fitAt(t.w as 1 | 2, t.h as 1 | 2);
      chosen = { x, y, w: t.w as 1 | 2, h: t.h as 1 | 2 };
    }

    // occupy and push
    for (let dy = 0; dy < chosen.h; dy++) {
      if (!grid[chosen.y + dy]) grid[chosen.y + dy] = Array(cols).fill(0);
      for (let dx = 0; dx < chosen.w; dx++) grid[chosen.y + dy][chosen.x + dx] = 1;
    }
    out.push({ x: chosen.x, y: chosen.y, w: chosen.w, h: chosen.h, tile: { ...t, w: chosen.w, h: chosen.h } });
  }

  // secondary compaction: slide newly placed tiles left
  const startIdx = existing.length;
  const setOcc = (x: number, y: number, w: number, h: number, val: number) => {
    for (let dy = 0; dy < h; dy++) {
      if (!grid[y + dy]) grid[y + dy] = Array(cols).fill(0);
      for (let dx = 0; dx < w; dx++) grid[y + dy][x + dx] = val;
    }
  };

  const movable = out.slice(startIdx).sort((a, b) => a.y - b.y || a.x - b.x);
  for (const p of movable) {
    setOcc(p.x, p.y, p.w, p.h, 0);
    let targetX = p.x;
    while (targetX > 0) {
      let canSlide = true;
      for (let dy = 0; dy < p.h && canSlide; dy++) {
        if (!grid[p.y + dy]) grid[p.y + dy] = Array(cols).fill(0);
        for (let dx = 0; dx < p.w; dx++) {
          if (grid[p.y + dy][(targetX - 1) + dx]) { canSlide = false; break; }
        }
      }
      if (!canSlide) break;
      targetX--;
    }
    setOcc(targetX, p.y, p.w, p.h, 1);
    p.x = targetX;
  }

  return out;
}

type PixelNode = {
  key: string;
  tile: Tile;
  style: React.CSSProperties;
};

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
