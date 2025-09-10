"use client";

import Image from "next/image";
import { useHoverSlideshow } from "@/hooks/useUI";
import { Progress } from "@/components/ui/progress";

interface HoverSlideshowProps {
	firstSrc: string;
	others: { src: string; alt?: string }[];
	widthPx: number;
	alt?: string;
}

export function HoverSlideshow({
	firstSrc,
	others,
	widthPx,
	alt,
}: HoverSlideshowProps) {
	const imgs = [firstSrc, ...others.map((o) => o.src)];
	const alts = [alt || "", ...others.map((o) => o.alt || "")];

	const { hovered, setHovered, currentIndex, progress } =
		useHoverSlideshow(imgs);

	return (
		<div
			className="absolute inset-0"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{imgs.map((src, i) => (
				<Image
					key={i}
					src={src}
					alt={alts[i]}
					fill
					sizes={`${widthPx}px`}
					className={`object-cover transition-opacity duration-300 ${
						i === currentIndex ? "opacity-100" : "opacity-0"
					}`}
					unoptimized
					quality={100}
					priority={false}
				/>
			))}
			{/* Darken image on parent article hover only */}
			<div className="pointer-events-none absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
			{imgs.length > 1 && (
				<div className="absolute bottom-1 left-0 right-0 z-20 flex gap-1 px-6">
					{imgs.map((_, i) => (
						<Progress
							key={i}
							value={
								hovered
									? i < currentIndex
										? 100
										: i === currentIndex
											? progress
											: 0
									: 0
							}
							className="h-0.5 flex-1 bg-white/30 [&>div]:bg-white [&>div]:transition-none"
						/>
					))}
				</div>
			)}
		</div>
	);
}
