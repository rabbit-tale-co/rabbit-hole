"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { packAppendGeneric } from "@/hooks/useBento";

type SkelTile = { id: string; w: 1 | 2; h: 1 | 2 };

function makeSkeletonTiles(count: number): SkelTile[] {
  // A pleasant repeating pattern: 2x1,1x2,1x1,1x1,(rare)2x2
  const pattern: SkelTile[] = [
    { id: "a", w: 2, h: 1 },
    { id: "b", w: 1, h: 2 },
    { id: "c", w: 1, h: 1 },
    { id: "d", w: 1, h: 1 },
    { id: "e", w: 2, h: 2 },
  ];
  const arr: SkelTile[] = [];
  let i = 0;
  while (arr.length < count) {
    const p = pattern[i % pattern.length];
    arr.push({ ...p, id: `${p.id}-${arr.length}` });
    i++;
  }
  return arr.slice(0, count);
}

export function BentoSkeleton({
  cols,
  containerWidth,
  gap = 12,
  count = 12,
}: {
  cols: number;
  containerWidth: number;
  gap?: number;
  count?: number;
  className?: string;
}) {
  // each column width in px
  const cell = cols > 0 ? Math.floor((containerWidth - (cols - 1) * gap) / cols) : 0;

  const placed = useMemo(() => {
    const tiles = makeSkeletonTiles(count);
    return packAppendGeneric([], tiles, Math.max(cols, 1));
  }, [cols, count]);

  const rows = placed.length ? Math.max(...placed.map((p) => p.y + p.h)) : 0;
  const containerHeight = rows > 0 ? rows * cell + (rows - 1) * gap : 0;

  return (
    <div className="relative" style={{ height: containerHeight }}>
      {placed.map((p) => {
        const top = p.y * (cell + gap);
        const left = p.x * (cell + gap);
        const width = p.w * cell + (p.w - 1) * gap;
        const height = p.h * cell + (p.h - 1) * gap;
        return (
          <div
            key={p.tile.id}
            className="absolute rounded-2xl overflow-hidden"
            style={{ top, left, width, height }}
          >
            <Skeleton className="w-full h-full bg-neutral-200" />
          </div>
        );
      })}
    </div>

  );
}
