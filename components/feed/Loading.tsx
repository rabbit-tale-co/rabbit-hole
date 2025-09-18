"use client";

import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type SkelTile = { id: string; w: 1 | 2; h: 1 | 2; x: number; y: number };

// Generate 3-row grid patterns based on column count
function generateSkeletonPresets(cols: number): SkelTile[][] {
  const maxWidth = Math.min(cols, 2); // Max width for tiles

  return [
    // Pattern 1: Balanced layout
    [
      { id: "a", w: Math.min(2, cols) as 1 | 2, h: 1, x: 0, y: 0 },
      ...(cols > 2 ? [{ id: "b", w: 1, h: 1, x: 2, y: 0 }] : []),
      ...(cols > 3 ? [{ id: "c", w: 1, h: 1, x: 3, y: 0 }] : []),
      { id: "d", w: 1, h: 2, x: 0, y: 1 },
      ...(cols > 1 ? [{ id: "e", w: 1, h: 1, x: 1, y: 1 }] : []),
      ...(cols > 2 ? [{ id: "f", w: Math.min(2, cols - 2) as 1 | 2, h: 1, x: 2, y: 1 }] : []),
      { id: "g", w: 1, h: 1, x: 0, y: 2 },
      ...(cols > 1 ? [{ id: "h", w: 1, h: 1, x: 1, y: 2 }] : []),
      ...(cols > 2 ? [{ id: "i", w: 1, h: 1, x: 2, y: 2 }] : []),
      ...(cols > 3 ? [{ id: "j", w: 1, h: 1, x: 3, y: 2 }] : []),
    ].filter(Boolean) as SkelTile[],

    // Pattern 2: Large featured items
    [
      { id: "a", w: Math.min(2, cols) as 1 | 2, h: 2, x: 0, y: 0 },
      ...(cols > 2 ? [{ id: "b", w: 1, h: 1, x: 2, y: 0 }] : []),
      ...(cols > 3 ? [{ id: "c", w: 1, h: 1, x: 3, y: 0 }] : []),
      ...(cols > 2 ? [{ id: "d", w: 1, h: 1, x: 2, y: 1 }] : []),
      ...(cols > 3 ? [{ id: "e", w: 1, h: 1, x: 3, y: 1 }] : []),
      { id: "f", w: 1, h: 1, x: 0, y: 2 },
      ...(cols > 1 ? [{ id: "g", w: 1, h: 1, x: 1, y: 2 }] : []),
      ...(cols > 2 ? [{ id: "h", w: 1, h: 1, x: 2, y: 2 }] : []),
      ...(cols > 3 ? [{ id: "i", w: 1, h: 1, x: 3, y: 2 }] : []),
    ].filter(Boolean) as SkelTile[],

    // Pattern 3: Grid-like layout
    [
      { id: "a", w: 1, h: 1, x: 0, y: 0 },
      ...(cols > 1 ? [{ id: "b", w: 1, h: 1, x: 1, y: 0 }] : []),
      ...(cols > 2 ? [{ id: "c", w: 1, h: 1, x: 2, y: 0 }] : []),
      ...(cols > 3 ? [{ id: "d", w: 1, h: 1, x: 3, y: 0 }] : []),
      { id: "e", w: Math.min(2, cols) as 1 | 2, h: 1, x: 0, y: 1 },
      ...(cols > 2 ? [{ id: "f", w: 1, h: 1, x: 2, y: 1 }] : []),
      ...(cols > 3 ? [{ id: "g", w: 1, h: 1, x: 3, y: 1 }] : []),
      { id: "h", w: 1, h: 1, x: 0, y: 2 },
      ...(cols > 1 ? [{ id: "i", w: 1, h: 1, x: 1, y: 2 }] : []),
      ...(cols > 2 ? [{ id: "j", w: Math.min(2, cols - 2) as 1 | 2, h: 1, x: 2, y: 2 }] : []),
    ].filter(Boolean) as SkelTile[],

    // Pattern 4: Mixed sizes
    [
      { id: "a", w: 1, h: 2, x: 0, y: 0 },
      ...(cols > 1 ? [{ id: "b", w: 1, h: 1, x: 1, y: 0 }] : []),
      ...(cols > 2 ? [{ id: "c", w: 1, h: 1, x: 2, y: 0 }] : []),
      ...(cols > 3 ? [{ id: "d", w: 1, h: 1, x: 3, y: 0 }] : []),
      ...(cols > 1 ? [{ id: "e", w: 1, h: 1, x: 1, y: 1 }] : []),
      ...(cols > 2 ? [{ id: "f", w: Math.min(2, cols - 2) as 1 | 2, h: 1, x: 2, y: 1 }] : []),
      { id: "g", w: 1, h: 1, x: 0, y: 2 },
      ...(cols > 1 ? [{ id: "h", w: 1, h: 1, x: 1, y: 2 }] : []),
      ...(cols > 2 ? [{ id: "i", w: 1, h: 1, x: 2, y: 2 }] : []),
      ...(cols > 3 ? [{ id: "j", w: 1, h: 1, x: 3, y: 2 }] : []),
    ].filter(Boolean) as SkelTile[],

    // Pattern 5: Asymmetric layout
    [
      { id: "a", w: 1, h: 1, x: 0, y: 0 },
      ...(cols > 1 ? [{ id: "b", w: Math.min(2, cols - 1) as 1 | 2, h: 1, x: 1, y: 0 }] : []),
      ...(cols > 3 ? [{ id: "c", w: 1, h: 1, x: 3, y: 0 }] : []),
      { id: "d", w: 1, h: 1, x: 0, y: 1 },
      ...(cols > 1 ? [{ id: "e", w: 1, h: 1, x: 1, y: 1 }] : []),
      ...(cols > 2 ? [{ id: "f", w: 1, h: 2, x: 2, y: 1 }] : []),
      ...(cols > 3 ? [{ id: "g", w: 1, h: 1, x: 3, y: 1 }] : []),
      { id: "h", w: Math.min(2, cols) as 1 | 2, h: 1, x: 0, y: 2 },
      ...(cols > 2 ? [{ id: "i", w: 1, h: 1, x: 2, y: 2 }] : []),
      ...(cols > 3 ? [{ id: "j", w: 1, h: 1, x: 3, y: 2 }] : []),
    ].filter(Boolean) as SkelTile[],
  ];
}

function makeSkeletonTiles(count: number, isClient: boolean, cols: number): SkelTile[] {
  const presets = generateSkeletonPresets(cols);

  if (!isClient) {
    // Server-side: use first preset to avoid hydration mismatch
    const preset = presets[0];
    return preset.slice(0, Math.min(count, preset.length));
  }

  // Client-side: cycle through presets for variety
  const presetIndex = Math.floor(Math.random() * presets.length);
  const preset = presets[presetIndex];
  return preset.slice(0, Math.min(count, preset.length));
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
  const [isClient, setIsClient] = useState(false);

  // each column width in px
  const cell =
    cols > 0 ? Math.floor((containerWidth - (cols - 1) * gap) / cols) : 0;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const tiles = useMemo(() => {
    return makeSkeletonTiles(count, isClient, cols);
  }, [count, isClient, cols]);

  // Calculate container height based on 3-row grid
  const containerHeight = 3 * cell + 2 * gap; // 3 rows with 2 gaps between them

  return (
    <div className="relative" style={{ height: containerHeight }}>
      {tiles.map((tile) => {
        const top = tile.y * (cell + gap);
        const left = tile.x * (cell + gap);
        const width = tile.w * cell + (tile.w - 1) * gap;
        const height = tile.h * cell + (tile.h - 1) * gap;
        return (
          <div
            key={tile.id}
            className="absolute rounded-3xl overflow-hidden"
            style={{ top, left, width, height }}
          >
            <Skeleton className="w-full h-full bg-neutral-200 dark:bg-neutral-800" />
          </div>
        );
      })}
    </div>
  );
}
