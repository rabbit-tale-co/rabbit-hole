import NumberFlow from "@number-flow/react";
import React, { useEffect, useRef, useState } from "react";
import { PremiumBadge } from "@/components/premium/PremiumFeature";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FollowDialog } from "./FollowDialog";

interface ProfileStatsProps {
	posts: number;
	views: number;
	following: number;
	followers: number;
	targetUserId?: string;
	targetUsername?: string;
	showPremiumBadge?: boolean;
	isOwnProfile?: boolean;
	showAdminStats?: boolean;
	isLoading?: boolean;
	onClickPosts?: () => void;
	onClickViews?: () => void;
	onClickFollowing?: () => void;
	onClickFollowers?: () => void;
}

export function ProfileStats({
	posts,
	views,
	following,
	followers,
	targetUserId,
	targetUsername,
	isOwnProfile = false,
	showAdminStats = false,
	isLoading = false,
	onClickPosts,
	onClickViews,
	onClickFollowing,
	onClickFollowers,
}: ProfileStatsProps) {
	const [followDialogOpen, setFollowDialogOpen] = useState(false);

	// Animation state for all counters
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const [animateViews, setAnimateViews] = useState(0);
	const [animatePosts, setAnimatePosts] = useState(0);
	const [animateFollowing, setAnimateFollowing] = useState(0);
	const [animateFollowers, setAnimateFollowers] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);
	const hasAnimatedRef = useRef(false);

	// Set up intersection observer for animation
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const obs = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !hasAnimatedRef.current && !isLoading) {
					hasAnimatedRef.current = true;
					setShouldAnimate(true);
					setTimeout(() => {
						console.log("Setting all animate values - all data loaded");
						setAnimateViews(views || 0);
						setAnimatePosts(posts || 0);
						setAnimateFollowing(following || 0);
						setAnimateFollowers(followers || 0);
					}, 100);
					obs.disconnect();
				}
			},
			{
				threshold: 0.6,
				rootMargin: "0px",
			},
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, [posts, views, following, followers, isLoading]);

	// Reset animation when stats change
	useEffect(() => {
		console.log(
			"ProfileStats stats changed:",
			{ posts, views, following, followers },
			"hasAnimated:",
			hasAnimatedRef.current,
		);
		if (hasAnimatedRef.current) {
			console.log("Updating all animate values");
			setAnimateViews(views || 0);
			setAnimatePosts(posts || 0);
			setAnimateFollowing(following || 0);
			setAnimateFollowers(followers || 0);
		}
	}, [posts, views, following, followers]);

	const handleFollowersClick = () => {
		if (onClickFollowers) {
			onClickFollowers();
		} else if (targetUserId && targetUsername) {
			setFollowDialogOpen(true);
		}
	};

	const handleFollowingClick = () => {
		if (onClickFollowing) {
			onClickFollowing();
		} else if (targetUserId && targetUsername) {
			setFollowDialogOpen(true);
		}
	};

	return (
		<>
			<div
				ref={containerRef}
				className="flex justify-center h-8 items-center space-x-1 tabular-nums"
			>
				<Button
					variant="ghost"
					size="sm"
					className="font-mono"
					onClick={onClickPosts}
				>
					<h4
						className="font-semibold text-neutral-950 dark:text-neutral-50 mr-0.5"
						data-profile-posts-count
					>
						<NumberFlow
							value={shouldAnimate ? animatePosts : 0}
							className="inline-block"
							transformTiming={{ duration: 400, easing: "ease-out" }}
							spinTiming={{ duration: 300, easing: "ease-out" }}
							opacityTiming={{ duration: 200, easing: "ease-out" }}
							animated={shouldAnimate}
						/>
					</h4>
					<span className="text-neutral-500 dark:text-neutral-400">Posts</span>
				</Button>
				{(isOwnProfile || showAdminStats) && (
					<>
						<Separator orientation="vertical" className="!h-4" />
						<Button
							variant="ghost"
							size="sm"
							className="font-mono"
							onClick={onClickViews}
						>
							<h4 className="font-semibold text-neutral-950 dark:text-neutral-50 mr-0.5">
								<NumberFlow
									value={shouldAnimate ? animateViews : 0}
									className="inline-block"
									transformTiming={{ duration: 400, easing: "ease-out" }}
									spinTiming={{ duration: 300, easing: "ease-out" }}
									opacityTiming={{ duration: 200, easing: "ease-out" }}
									animated={shouldAnimate}
								/>
							</h4>
							<span className="text-neutral-500 dark:text-neutral-400">
								Views
							</span>
						</Button>
					</>
				)}
				<Separator orientation="vertical" className="!h-4" />
				<Button
					variant="ghost"
					size="sm"
					className="font-mono"
					onClick={handleFollowingClick}
				>
					<h4 className="font-semibold text-neutral-950 dark:text-neutral-50 mr-0.5">
						<NumberFlow
							value={shouldAnimate ? animateFollowing : 0}
							className="inline-block"
							transformTiming={{ duration: 400, easing: "ease-out" }}
							spinTiming={{ duration: 300, easing: "ease-out" }}
							opacityTiming={{ duration: 200, easing: "ease-out" }}
							animated={shouldAnimate}
						/>
					</h4>
					<span className="text-neutral-500 dark:text-neutral-400">
						Following
					</span>
				</Button>
				<Separator orientation="vertical" className="!h-4" />
				<Button
					variant="ghost"
					size="sm"
					className="font-mono"
					onClick={handleFollowersClick}
				>
					<h4 className="font-semibold text-neutral-950 dark:text-neutral-50 mr-0.5">
						<NumberFlow
							value={shouldAnimate ? animateFollowers : 0}
							className="inline-block"
							transformTiming={{ duration: 400, easing: "ease-out" }}
							spinTiming={{ duration: 300, easing: "ease-out" }}
							opacityTiming={{ duration: 200, easing: "ease-out" }}
							animated={shouldAnimate}
						/>
					</h4>
					<span className="text-neutral-500 dark:text-neutral-400">
						Followers
					</span>
				</Button>
			</div>

			{targetUserId && targetUsername && (
				<FollowDialog
					open={followDialogOpen}
					onOpenChange={setFollowDialogOpen}
					targetUserId={targetUserId}
					targetUsername={targetUsername}
					followersCount={followers}
					followingCount={following}
				/>
			)}
		</>
	);
}
