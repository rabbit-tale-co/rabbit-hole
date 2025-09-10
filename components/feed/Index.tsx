"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import ProfileEmptyGallery, { HomeEmptyFeed } from "@/components/feed/Empty";
import { HoverSlideshow } from "@/components/feed/HoverSlideshow";
import { SocialActions } from "@/components/feed/interactions/social-actions";
import { BentoSkeleton } from "@/components/feed/Loading";
import { PostImpressionTracker } from "@/components/feed/PostImpressionTracker";
import { PostStats } from "@/components/feed/PostStats";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFeed } from "@/hooks/useFeed";
import { useIntersection } from "@/hooks/useIntersection";
import { OutlineCalendar } from "../icons/Icons";
import { Badge } from "../ui/badge";
import { TypographyP } from "../ui/typography/p";
import { UserChipHoverCard } from "../user/ProfileCard";

export default function Feed({
	initial,
	username,
	isOwnProfile,
	onCountChange,
	forceUpdate,
}: {
	initial?: any;
	username?: string;
	isOwnProfile?: boolean;
	onCountChange?: (n: number) => void;
	forceUpdate?: number;
}) {
	const {
		items,
		tiles,
		idToPost,
		authorProfiles,
		cols,
		placed,
		containerWidth,
		containerHeight,
		cell,
		gap,
		loading,
		error,
		hasMore,
		feedReady,
		animateGate,
		isTransitioning,
		rootRef,
		sentinelRef,
		loadMore,
		handlePostClick,
		publicUrl,
	} = useFeed(initial, username, isOwnProfile, onCountChange, forceUpdate);

	// container width is already provided by useFeed hook

	// initial loading (no items yet) or container not measured
	const firstLoad = items.length === 0 && loading;

	if (firstLoad || cell <= 0) {
		return (
			<div ref={rootRef} className="w-full max-w-[56rem] mx-auto mt-6">
				<BentoSkeleton
					cols={cols}
					containerWidth={containerWidth}
					gap={gap}
					count={6}
				/>
			</div>
		);
	}

	if (!loading && items.length === 0) {
		return username ? (
			<ProfileEmptyGallery isOwnProfile={!!isOwnProfile} />
		) : (
			<HomeEmptyFeed />
		);
	}

	return (
		<div ref={rootRef} className="w-full max-w-[56rem] mx-auto mt-6">
			{/* hover slideshow handled within tiles; click-through to post page */}

			<div
				className={`relative transition-all duration-300 ease-out ${
					isTransitioning ? "opacity-70" : "opacity-100"
				}`}
				style={{ height: containerHeight, minHeight: Math.max(240, cell) }}
			>
				{placed.map((p) => {
					const top = p.y * (cell + gap);
					const left = p.x * (cell + gap);
					const width = Math.max(1, p.w * cell + (p.w - 1) * gap);
					const height = Math.max(1, p.h * cell + (p.h - 1) * gap);

					return (
						<motion.article
							key={p.tile.id}
							data-post-id={p.tile.id}
							onClick={() => handlePostClick(p.tile.id)}
							className={`group absolute bg-neutral-100 dark:bg-neutral-900 ring-1 ring-ring/30 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ease-out ${
								isTransitioning
									? "opacity-50 scale-95"
									: "opacity-100 scale-100"
							}`}
							style={{
								top,
								left,
								width,
								height,
								minWidth: 160,
								minHeight: 160,
							}}
							initial="rest"
							whileHover="hover"
							transition={{ duration: 0.3, ease: "easeOut" }}
						>
							{/* Track impressions for this post */}
							<PostImpressionTracker postId={p.tile.id} />

							{(() => {
								const post = idToPost.get(p.tile.id);
								const medias = post?.images || [];
								const first = medias[0];
								if (!first) return null;
								const firstUrl = publicUrl(first.path || "");
								const isVideo = String(first.mime || "").startsWith("video/");
								if (isVideo) {
									return (
										<div className="absolute inset-0">
											<video
												src={firstUrl}
												className="absolute inset-0 w-full h-full object-cover"
												muted
												playsInline
												preload="metadata"
											/>
											<div className="pointer-events-none absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
										</div>
									);
								}
								// First is image: build slideshow only from image assets (skip videos to avoid Next/Image errors)
								const restImageMedias = medias
									.slice(1)
									.filter(
										(im) =>
											!String((im as { mime?: string }).mime || "").startsWith(
												"video/",
											),
									);
								return (
									<HoverSlideshow
										firstSrc={firstUrl || ""}
										others={restImageMedias.map((im) => ({
											src: publicUrl(im.path || ""),
											alt: im.alt || "",
										}))}
										widthPx={Math.ceil(width)}
										alt={p.tile.cover.alt || ""}
									/>
								);
							})()}

							{/* overlays in BentoGallery style: top-left user, top-right date, bottom actions */}
							{(() => {
								const post = idToPost.get(p.tile.id);
								const profile = post
									? authorProfiles.get(post.author_id)
									: undefined;
								const dateLabel = post?.created_at
									? new Date(post.created_at).toLocaleDateString(undefined, {
											month: "short",
											day: "numeric",
											year: "numeric",
										})
									: "";

								return (
									<>
										{/* top-left user */}
										{profile && !username && (
											<div
												className="absolute top-2 left-2 sm:top-3 sm:left-3 z-30 text-white"
												onClick={(e) => {
													e.stopPropagation();
												}}
											>
												<UserChipHoverCard
													user={{
														user_id: profile.user_id,
														username: profile.username,
														avatarUrl: profile.avatar_url,
														displayName: profile.display_name,
														bio: profile.bio,
														coverUrl: profile.cover_url,
														isPremium: profile.is_premium,
													}}
													size={"sm"}
													insideLink
												/>
											</div>
										)}

										{/* top-right date and stats */}
										<div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 text-white flex flex-col items-end gap-2">
											{/* Date */}
											<TooltipProvider delayDuration={150}>
												<Tooltip>
													<TooltipTrigger asChild>
														<Badge className="bg-black/50 text-white">
															<OutlineCalendar />
															{dateLabel}
														</Badge>
													</TooltipTrigger>
													<TooltipContent
														side="bottom"
														align="center"
														className="text-xs"
													>
														{post?.created_at
															? new Date(post.created_at).toLocaleString()
															: ""}
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>

											{/* Post Stats */}
											<Badge className="bg-black/50">
												<PostStats stats={post?.stats} />
											</Badge>
										</div>
										{/* bottom gradient + actions row */}
										<div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
										<div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
										<div className="absolute flex flex-col gap-2 inset-x-0 bottom-0 p-2 sm:p-3 pointer-events-none">
											{/* Post preview: bottom-anchored, max 3 lines */}
											{post?.text && (
												<motion.div
													className="w-full pointer-events-none transform-gpu [will-change:opacity,transform,filter] md:opacity-0 md:y-8"
													variants={{
														rest: {
															opacity: 0,
															y: 8,
															transition: {
																opacity: {
																	duration: 0.15,
																	ease: [0.16, 1, 0.3, 1],
																	delay: 0.0,
																}, // leave: fade first
																y: {
																	duration: 0.15,
																	ease: [0.16, 1, 0.3, 1],
																	delay: 0.0,
																},
															},
														},
														hover: {
															opacity: 1,
															y: 0,
															transition: {
																opacity: {
																	duration: 0.15,
																	ease: [0.16, 1, 0.3, 1],
																	delay: 0.15,
																}, // enter: fade after blur
																y: {
																	duration: 0.15,
																	ease: [0.16, 1, 0.3, 1],
																	delay: 0.15,
																},
															},
														},
													}}
												>
													{/* 3 lines * 1.25rem line-height = 3.75rem */}
													<div className="min-h-[3.75rem] flex flex-col justify-end">
														<motion.div
															className="[will-change:filter] md:blur-0"
															variants={{
																// enter: de-blur immediately
																hover: {
																	filter: "blur(0px)",
																	transition: {
																		duration: 0.15,
																		ease: [0.16, 1, 0.3, 1],
																		delay: 0.0,
																	},
																},
																// leave: blur after the fade completes
																rest: {
																	filter: "blur(8px)",
																	transition: {
																		duration: 0.15,
																		ease: [0.16, 1, 0.3, 1],
																		delay: 0.15,
																	},
																},
															}}
														>
															<TypographyP
																className="
                                text-xs text-white leading-[1.25rem]
                                line-clamp-3
                                [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]
                              "
															>
																{post.text}
															</TypographyP>
														</motion.div>
													</div>
												</motion.div>
											)}
											<SocialActions
												postId={p.tile.id}
												likes={post?.like_count ?? 0}
												comments={post?.comment_count ?? 0}
												reposts={post?.repost_count ?? 0}
												bookmarks={post?.bookmark_count ?? 0}
												isLiked={post?.is_liked ?? false}
												isReposted={false}
												isBookmarked={false}
												showBookmarksCount={false}
												animateGate={animateGate}
												onLike={(e) => {
													e.preventDefault();
													e.stopPropagation();
												}}
												onComment={(e) => {
													e.preventDefault();
													e.stopPropagation();
												}}
												onRepost={(e) => {
													e.preventDefault();
													e.stopPropagation();
												}}
												onBookmark={(e) => {
													e.preventDefault();
													e.stopPropagation();
												}}
											/>
										</div>
									</>
								);
							})()}
						</motion.article>
					);
				})}
			</div>

			<div ref={sentinelRef} style={{ height: 1, opacity: 0 }} />

			{/* {loading && (
        <div className="py-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-neutral-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600"></div>
            Loading more posts...
          </div>
        </div>
      )} */}

			{process.env.NODE_ENV === "development" && (
				<div className="py-2 text-center text-xs text-gray-400">
					Debug: loading={loading.toString()}, hasMore={hasMore.toString()},
					items={items.length}
					<br />
					<button
						onClick={() => loadMore()}
						className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
					>
						Test Load More
					</button>
				</div>
			)}

			{/* lightweight status */}
			{error && (
				<div className="py-6 text-center text-sm text-red-600">
					Error: {error}
				</div>
			)}
			{!hasMore && !loading && (
				<div className="py-8 text-center text-sm text-neutral-400">
					You&apos;re all caught up.
				</div>
			)}
		</div>
	);
}
