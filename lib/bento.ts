import type { PlacedTile, Tile } from "@/types";

export function bucketFromWH(
	w: number,
	h: number,
): {
	w: 1 | 2;
	h: 1 | 2;
} {
	const a = w / h;
	if (w >= 1200 && h >= 1200 && Math.abs(a - 1) < 0.15) return { w: 2, h: 2 };
	if (a >= 1.3) return { w: 2, h: 1 };
	if (a <= 1 / 1.3) return { w: 1, h: 2 };
	return { w: 1, h: 1 };
}

// type Size = { w: 1 | 2; h: 1 | 2 };
// const area = (s: Size) => (s.w * s.h) as 1 | 2 | 4;

// function variantsFor(w: 1 | 2, h: 1 | 2): Size[] {
// 	if (w === 2 && h === 2)
// 		return [
// 			{ w: 2, h: 2 },
// 			{ w: 2, h: 1 },
// 			{ w: 1, h: 2 },
// 			{ w: 1, h: 1 },
// 		];
// 	if (w === 2 && h === 1)
// 		return [
// 			{ w: 2, h: 1 },
// 			{ w: 1, h: 1 },
// 		];
// 	if (w === 1 && h === 2)
// 		return [
// 			{ w: 1, h: 2 },
// 			{ w: 1, h: 1 },
// 		];
// 	return [{ w: 1, h: 1 }];
// }

type PixelNode = {
	key: string;
	tile: Tile;
	style: React.CSSProperties;
};

export function toPixels(placed: PlacedTile[], cell: number, gap: number) {
	const leftPx = (x: number) => x * cell + x * gap;
	const topPx = (y: number) => y * cell + y * gap;
	const widthPx = (w: number) => w * cell + (w - 1) * gap;
	const heightPx = (h: number) => h * cell + (h - 1) * gap;

	const nodes: PixelNode[] = placed.map((p) => ({
		key: p.tile.id,
		tile: p.tile,
		style: {
			position: "absolute",
			left: leftPx(p.x),
			top: topPx(p.y),
			width: widthPx(p.w),
			height: heightPx(p.h),
		},
	}));

	const rows = placed.length ? Math.max(...placed.map((p) => p.y + p.h)) : 0;
	const containerHeight = rows > 0 ? rows * cell + (rows - 1) * gap : 0;

	return { nodes, containerHeight };
}
